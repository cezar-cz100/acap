(function(){

_Application.Pages = _Components.Container.extend(
{
    __interface: [ 'open' ],
    
    _setup_: function()
    {
        this.StructuraData = DataResource.get( 'Structura' );
    },
    
    _setupResources_: function()
    {
        this._setupPanes();
    },
    
    _setupPanes: function()
    {
        this.Panes = new PagePanesConstructor( this.find( '.pages-pane-container' ) , {
            $tabsContainer:     this.find( '.pages-menu' ),
            paneConstructors:   {
//                welcome:    _Welcome.Module,
                spatii:         _Spatii.Module,
//                luna_lucru: _LunaLucru.Module,
                cheltuieli:     _Cheltuieli.Module,
                configurare:    _Configurare.Module
            }
        });
    },
    
    open: function( page, pageOptions )
    {
        this.Panes.showPane( page, pageOptions );
    }
    
});

//==============================================================================

var PagePanesConstructor = _Components.Panes.extend(
{
    _setup_: function()
    {
        this.viewModeConstructors = {
            normal:     ViewModeNormal,
            configure:  ViewModeConfigure
        };
        
        this.ViewModes = {};
        this.currentViewMode = null;
    },
    
    _init_: function()
    {
        var Configuration = DataResource.get( 'Configuration' );
        
        this._setMode( Configuration.isInitialized() ? 'normal' : 'configure' );
    },
   
    _setMode: function( mode )
    {
        if( this.ViewModes[ mode ] === undefined && _Components.Class.isExtendedFrom( this.viewModeConstructors[ mode ], _ViewModeAbstract ) )
        {
            this.ViewModes[ mode ] = new this.viewModeConstructors[ mode ]( this );
        }
        
        if( this.ViewModes[ mode ] instanceof _ViewModeAbstract )
        {
            this.currentViewMode = this.ViewModes[ mode ];
            this.currentViewMode.apply();
        }
    }
    
});

////////////////////////////////////////////////////////////////////////////////

var _ViewModeAbstract = _Components.Class.extend(
{
    init: function( Panes )
    {
        this.Panes = Panes;
        this.viewMode = null;
        
        this.ConfigurationData = DataResource.get( 'Configuration' );
        this.CheltuieliData = DataResource.get( 'Cheltuieli' );
        
        this._runHierarchy( '_setup_' );
        
        if( !this.viewMode )
        {
            throw new Error( 'viewMode is not set' );
        }
        
        this.$tabs = this._getPaneTabs().filter( '[data-view='+ this.viewMode + ']' );
    },
    
    apply: function()
    {
        this._showTabs();
        
        this._runHierarchy( '_apply_' );
    },
    
    _getPaneTabs: function()
    {
        return this.Panes._getTabs();
    },
    
    _hideAllTabs: function()
    {
        this.Panes._getTabs().hide();
    },
    
    _getTabs: function()
    {
        return this.$tabs;
    },
    
    _showTabs: function()
    {
        this._hideAllTabs();
        this._getTabs().show();
    }
});

////////////////////////////////////////////////////////////////////////////////

var ViewModeNormal = _ViewModeAbstract.extend(
{
    _setup_: function()
    {
        this.viewMode = 'normal';
    },
    
    _apply_: function()
    {
        var Panes = this.Panes,
            defaultPaneId;
        
        // daca nu exista cheltuieli, se afiseaza pagina Cheltuieli/Facturi;
        // altfel, se afiseaza pagina Liste de Plata
        
//        defaultPaneId = this.CheltuieliData.hasCheltuieliCurente() ?
//            'cheltuieli':
//            'liste';
//        
        defaultPaneId = 'cheltuieli';
        
        Panes.showPane( defaultPaneId );
    }
    
});

////////////////////////////////////////////////////////////////////////////////

var ViewModeConfigure = _ViewModeAbstract.extend(
{
    _setup_: function()
    {
        var self = this,
            configurationStep = this.ConfigurationData.getInitializationStep();
        
        this.viewMode = 'configure';
        
        this.Panes.addHandler( 'loadPane', function( event )
        {
            var args = event.getArguments(),
                paneId = args[ 0 ],
                Pane = args[ 1 ],
                tabIndex = self._getTabIndexByPaneId( paneId );
            
            if( configurationStep === undefined || configurationStep === null || configurationStep == tabIndex )
            {
                Pane.sendParameters( { showNextStepButton: true } );
                Pane.addHandler( 'continue', function()
                {
                    self._showNextPane( function()
                    {
                        Pane.sendParameters( { showNextStepButton: false } );
                    });
                });
            }
            
            Pane.addHandler( 'freeze', function()
            {
                if( self.Panes.currentViewMode !== self ) return;
                
                self._setFreezedPage( paneId );
            });
            
            Pane.addHandler( 'unfreeze', function()
            {
                if( self.Panes.currentViewMode !== self ) return;
                
                self._clearFreezedPage( paneId );
            });
            
        });
    },
    
    _apply_: function()
    {
        var Panes = this.Panes,
            configurationStep = this.ConfigurationData.getInitializationStep(),
            freezedPage = this.ConfigurationData.getFreezedPage(),
            paneIdToDisplay;
    
        if( configurationStep === undefined || configurationStep === null )
        {
            Panes._disableAllTabs();
            Panes.showPane( 'welcome' );
        }
        else
        {
            // se activeaza tab-urile pana la `configurationStep`, inclusiv
            this._getTabs().each( function( index )
            {
                var $tab = $(this);

                if( index <= configurationStep )
                {
                    Panes._enableTab( $tab );
                }
                else
                {
                    Panes._disableTab( $tab );
                }
            });

            // afisare implicita a ultimului tab activ sau a paginii blocate
            if( freezedPage )
            {
                paneIdToDisplay = freezedPage;
                this._deactivateOtherTabs( paneIdToDisplay );
            }
            else
            {
                paneIdToDisplay = Panes._getPaneIdOfTab( this._getTabs().eq( configurationStep ) );
            }

            Panes.showPane( paneIdToDisplay );
        }
    },
    
    _showNextPane: function( callback )
    {
        var self = this;
        
        System.request({
            action:     'next-init-step',
            onSuccess: function( response )
            {
                var nextTabIndex = response.step,
                    nextPaneId = self._getPaneIdByIndex( nextTabIndex );

                self.Panes._enableTab( nextPaneId );
                self.Panes.showPane( nextPaneId );
                
                Object.isFunction( callback ) && callback.call( self );
            }
        });
        
    },
    
    _getPaneIdByIndex: function( index )
    {
        var $tab    = this._getTabs().eq( index ),
            paneId  = this.Panes._getPaneIdOfTab( $tab );
    
        return paneId;
    },
    
    _getTabIndexByPaneId: function( paneId )
    {
        var self = this,
            tabIndex = -1,
            index = 0;
    
        this._getTabs().each( function()
        {
            var $tab = $(this),
                pId = self.Panes._getPaneIdOfTab( $tab );
            
            if( paneId == pId )
            {
                tabIndex = index;
                
                return false;
            }
            
            index++;
        });
    
        return tabIndex;
    },
    
    _deactivateOtherTabs: function( paneId )
    {
        var self = this;
        
        this._getTabs().each( function()
        {
            var $tab = $(this),
                tabId = self.Panes._getPaneIdOfTab( $tab );
            
            // skip current tab
            if( paneId == tabId ) return;
            
            // save current state of the tab
            $tab.data( 'tab-state-disabled', self.Panes._isTabDisabled( $tab ) );
            
            self.Panes._disableTab( $tab );
        });
    },
    
    _reactivateOtherTabs: function( paneId )
    {
        var self = this;
        
        this._getTabs().each( function()
        {
            var $tab = $(this),
                tabId = self.Panes._getPaneIdOfTab( $tab ),
                tabStateDisabled;
            
            // skip current tab
            if( paneId == tabId ) return;
            
            // restore state of the tab
            tabStateDisabled = $tab.data( 'tab-state-disabled' );
            
            if( tabStateDisabled )
            {
                self.Panes._disableTab( $tab );
            }
            else
            {
                self.Panes._enableTab( $tab );
            }
        });
    },
    
    _setFreezedPage: function( paneId )
    {
        this._deactivateOtherTabs( paneId );
        
        System.request({
            action: 'set-freezed-page',
            loader: false,
            params: {
                page:   paneId
            }
        });
    },
    
    _clearFreezedPage: function( paneId )
    {
        this._reactivateOtherTabs( paneId );
        
        System.request({
            action: 'clear-freezed-page',
            loader: false
        });
    }
    
});

})();