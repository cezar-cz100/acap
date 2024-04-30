(function(){

var RepartizareAsociatieClass = _Components.Container.extend(
{
    __interface: [ 'getRepartizare', 'setRepartizare' ],
    __events: [ 'change' ],
    
    _setup_: function()
    {
        this._setRequiredOptions( [ 'parametruSpatii' ] );
    },
    
    _setupResources_: function()
    {
        var self = this;
        
        this.SelectionFrame = new SelectionFrameConstructor( this.find( '.selection-frame' ), {
            Context:    this,
            parametru:  this.getOption( 'parametruSpatii' ),
            onChange:   function( event, selection )
            {
                self._trigger( 'change', selection );
            }
        });
    },
    
    _reset_: function()
    {
        this.SelectionFrame.reset();
    },
    
    getRepartizare: function()
    {
        return this.SelectionFrame.getSelection();
    },
    
    setRepartizare: function( repartizare )
    {
        this.SelectionFrame.setSelection( repartizare );
    }
    
});

//==============================================================================

var SelectionFrameConstructor = _Components.Container.extend(
{
    __interface: [ 'getSelection', 'setSelection' ],
    
    _setup_: function()
    {
        this._setRequiredOptions( [ 'Context', 'parametru' ] );
        
        this.Context            = this.getOption( 'Context' );
        this.parametruSpatii    = this.getOption( 'parametru' );
        
        this.SelectionUnitClasses = {
            suprafata:  SuprafataSelectionConstructor,
            persoane:   PersoaneSelectionConstructor
        };
        
        this.SelectionUnit = null;
    },
    
    _setupResources_: function()
    {
        if( this.SelectionUnitClasses[ this.parametruSpatii ] === undefined )
        {
            System.exception( ExceptionCodes.UNEXPECTED_VALUE, { argument: 'parametru' } );
        }
        
        if( !_Components.Class.isExtendedFrom( this.SelectionUnitClasses[ this.parametruSpatii ], __SelectionAbstract ) )
        {
            System.exception( ExceptionCodes.INVALID_CLASS );
        }
        
        this.SelectionUnit = new ( this.SelectionUnitClasses[ this.parametruSpatii ] )( this );
    },
    
    _setupActions_: function()
    {
        var self = this;
        
        this.SelectionUnit.addHandler( 'change', function( event, selection )
        {
            self._trigger( 'change', selection );
        });
    },
    
    _reset_: function()
    {
        this.SelectionUnit && this.SelectionUnit.reset();
    },

    getSelection: function()
    {
        return this.SelectionUnit.getSelection();
    },
    
    setSelection: function( selection )
    {
        return this.SelectionUnit.setSelection( selection );
    }
    
});

//==============================================================================

var __SelectionAbstract = _Components.Container.extend(
{
    __interface: [ 'getSelection', 'setSelection' ],
    
    _setup_: function()
    {
        this.parametruSpatii = null;
    },
    
    _setupResources_: function()
    {
        if( Object.isEmpty( this.parametruSpatii ) )
        {
            System.exception( ExceptionCodes.UNDEFINED_PARAMETER, { parameter: 'parametruSpatii' }, 1 );
        }
        
        this.View   = new SelectionViewConstructor( this, {
            parametruSpatii: this.parametruSpatii
        });
        
        this.Model  = new SelectionModelConstructor( this );
    },

    _setupActions_: function()
    {
        this.bindSelectActions();
    },
    
    _reset_: function()
    {
        this.Model.reset();
        this.updateView();
    },
    
    getSelection: function()
    {
        return this.Model.getSelection();
    },
    
    setSelection: function( selection )
    {
        this.Model.setSelection( selection );
        this.updateView();
    },
    
    bindSelectActions: function()
    {
        var self = this;
        
        this.View.addHandler( 'toggleAllChoice', function()
        {
            self.toggleAllChoice();
            self.triggerChange();
        });
        
        this.View.addHandler( 'toggleBlocChoice', function( event, blocId )
        {
            self.toggleBlocChoice( blocId );
            self.triggerChange();
        });
        
        this.View.addHandler( 'toggleScaraChoice', function( event, scaraId )
        {
            self.toggleScaraChoice( scaraId );
            self.triggerChange();
        });
        
        this.View.addHandler( 'selectSpatiiScara', function( event, scaraId, selection )
        {
            self.setSpatiiScaraSelection( scaraId, selection );
            self.triggerChange();
        });
    },
    
    triggerChange: function()
    {
        this._trigger( 'change', this.getSelection() );
    },
    
    toggleAllChoice: function()
    {
        this.Model.toggleAllChoice();
        this.updateView();
    },
    
    toggleBlocChoice: function( blocId )
    {
        this.Model.toggleBlocChoice( blocId );
        this.updateView();
    },
    
    toggleScaraChoice: function( scaraId )
    {
        this.Model.toggleScaraChoice( scaraId );
        this.updateView();
    },
    
    updateView: function()
    {
        this.View.update( this.Model.getData() );
    },
    
    setSpatiiScaraSelection: function( scaraId, selection )
    {
        this.Model.setSpatiiScaraSelection( scaraId, selection );
        this.updateView();
    }
    
});

//------------------------------------------------------------------------------

var SelectionViewConstructor = _Components.Container.extend(
{
    __interface: [ 'update' ],
    __events: [ 'toggleAllChoice', 'toggleBlocChoice', 'toggleScaraChoice', 'selectSpatiiScara' ],
    
    _setup_: function()
    {
        this._setRequiredOptions( [ 'parametruSpatii' ] );
        
        this.parametruSpatii = this.getOption( 'parametruSpatii' );
        
        this.RepartizareScari = {};
    },
    
    _setupElements_: function()
    {
        this.$blocuriContainer = this.find( '.blocuri-container' );
        
        this.$allChoice = this.find( '.all-choice :checkbox' );
    },

    _setupResources_: function()
    {
        this.StructuraData = DataResource.get( 'Structura' );
    },

    _setupActions_: function()
    {
        this.bindSelectActions();
    },
        
    _init_: function()
    {
        this.generateContent();
        this.selectAllCheckboxes();
    },
    
    _reset_: function()
    {
        this.selectAllCheckboxes();
    },
    
    update: function( selectionData )
    {
        this.updateAllChoiceView( selectionData );
        this.updateBlocChoicesView( selectionData );
        this.updateScaraChoicesView( selectionData );
    },
    
    /**
     * @todo daca exista doar un singur bloc, se vor afisa doar scarile
     * @todo daca exista doar o singura scara in toata asociatia, nu se va mai afisa ( a se vedea pag. 664)
     */
    generateContent: function()
    {
        var self    = this,
            blocuri = this.StructuraData.getBlocuri();
        
        this.$blocuriContainer.empty();
        
        blocuri.each( function( blocData )
        {
            var $blocItem = self.generateBlocItem( blocData );
            
            $blocItem.appendTo( self.$blocuriContainer );
        });
    },
        
    generateBlocItem: function( blocData )
    {
        var self        = this,
            $blocItem   = this._getTemplate( 'bloc-choice-wrapper' ),
            $blocChoice = $blocItem.find( '.bloc-choice' ),
            $scariContainer = $blocItem.find( '.scari-container' );
        
        // $blocItem.data( 'bloc_id', blocData.id );
        
        $blocChoice.find( ':checkbox' ).val( blocData.id );
        $blocChoice.find( '.denumire-bloc' ).text( blocData.denumire );
        
        blocData.scari.each( function( scaraData )
        {
            var $scaraItem = self.generateScaraItem( scaraData );
            
            $scaraItem.appendTo( $scariContainer );
        });
        
        return $blocItem;
    },
    
    generateScaraItem: function( scaraData )
    {
        var self = this,
            $scaraItem  = this._getTemplate( 'scara-choice' ),
            scaraId = scaraData.id;
        
        // $scaraItem.data( 'scara_id', scaraData.id );
        
        $scaraItem.find( ':checkbox' ).val( scaraId );
        $scaraItem.find( '.denumire-scara' ).text( scaraData.denumire );
        
        this.RepartizareScari[ scaraId ] = new _Cheltuieli.RepartizareScara( $scaraItem.find( '.repartizare-scara-component' ), {
                scaraId:    scaraId,
                parametru:  this.parametruSpatii,
                shortSummary: true,
                onSelect:   function( event, selection )
                {
                    self._trigger( 'selectSpatiiScara', scaraId, selection );
                }
        });
        
        return $scaraItem;
    },
    
    bindSelectActions: function()
    {
        var self = this;
        
        this.bind( 'click', '.all-choice >label', function( event )
        {
            if( !$( event.target ).is( ':checkbox' ) )
            {
                event.preventDefault();
            }
            
            self._trigger( 'toggleAllChoice' );
        });
        
        this.bind( 'click', '.bloc-choice >label', function( event )
        {
            if( !$( event.target ).is( ':checkbox' ) )
            {
                event.preventDefault();
            }
            
            var blocId = $(this).find( ':checkbox' ).val();
            
            self._trigger( 'toggleBlocChoice', blocId );
        });
        
        this.bind( 'click', '.scara-choice >label', function( event )
        {
            if( !$( event.target ).is( ':checkbox' ) )
            {
                event.preventDefault();
            }
            
            var scaraId = $(this).find( ':checkbox' ).val();
            
            self._trigger( 'toggleScaraChoice', scaraId );
        });
    },
    
    getScaraIdOfElement: function( $element )
    {
        var $scaraItem  = $element.closest( '.scara-choice' ),
            scaraId     = $scaraItem.data( 'data' ).id;
    
        return scaraId;
    },
    
    getAllChoiceElement: function()
    {
        return this.$allChoice;
    },
    
    getBlocChoiceElements: function()
    {
        return this.find( '.bloc-choice :checkbox' );
    },
    
    getScaraChoiceElements: function()
    {
        return this.find( '.scara-choice :checkbox' );
    },
    
    updateAllChoiceView: function( selectionData )
    {
        var attributes = this.getViewAttributes( selectionData.all );
        
        this.getAllChoiceElement().prop( attributes );
    },

    updateBlocChoicesView: function( selectionData )
    {
        var self = this;
        
        this.getBlocChoiceElements().each( function()
        {
            var $checkbox = $(this),
                blocId = $checkbox.val(),
                attributes = self.getViewAttributes( selectionData.blocuri[ blocId ] );
                
            $checkbox.prop( attributes );
        });
    },
    
    updateScaraChoicesView: function( selectionData )
    {
        var self = this;
        
        this.getScaraChoiceElements().each( function()
        {
            var $checkbox = $(this),
                scaraId = $checkbox.val(),
                attributes = self.getViewAttributes( selectionData.scari[ scaraId ] );
                
            $checkbox.prop( attributes );
            
            self.RepartizareScari[ scaraId ].setRepartizare( selectionData.scari[ scaraId ].spatiiSelection );
        });
    },
    
    getViewAttributes: function( selection )
    {
        var attributes = {};
        
        if( selection.checked )
        {
            attributes = {
                checked:        true,
                indeterminate:  false
            };
        }
        else if( selection.indeterminate )
        {
            attributes = {
                checked:        false,
                indeterminate:  true
            };
        }
        else
        {
            attributes = {
                checked:        false,
                indeterminate:  false
            };
        }
        
        return attributes;
    },
    
    clearCheckboxes: function()
    {
        this.find( ':checkbox' ).prop({
            checked:    false,
            indeterminate: false
        });
    },
    
    selectAllCheckboxes: function()
    {
        this.find( ':checkbox' ).prop({
            checked:    true,
            indeterminate: false
        });
    }
    
});

//------------------------------------------------------------------------------

var SelectionModelConstructor = _Components.Model.extend(
{
    __interface: [ 'toggleAllChoice', 'toggleBlocChoice', 'toggleScaraChoice', 'getSelection', 'setSelection', 'getData', 'getSpatiiScaraSelection', 'setSpatiiScaraSelection' ],
    
    _setup_: function()
    {
        this.selection = {};
        
        this.StructuraData = DataResource.get( 'Structura' );
    },
    
    _init_: function()
    {
        this.setupSelection();
    },
    
    _reset_: function()
    {
        this.setupSelection();
    },
    
    toggleAllChoice: function()
    {
        var newState = !this.selection.all.checked;
        
        if( newState )
        {
            this.checkAllChoice();
        }
        else
        {
            this.uncheckAllChoice();
        }
    },
    
    toggleBlocChoice: function( blocId )
    {
        var newState = !this.selection.blocuri[ blocId ].checked;
        
        if( newState )
        {
            this.checkBlocChoice( blocId );
        }
        else
        {
            this.uncheckBlocChoice( blocId );
        }
        
        this.updateAllChoice();
    },
    
    toggleScaraChoice: function( scaraId )
    {
        var newState = !this.selection.scari[ scaraId ].checked,
            blocId = this.getBlocId( scaraId );
        
        if( newState )
        {
            this.checkScaraChoice( scaraId );
        }
        else
        {
            this.uncheckScaraChoice( scaraId );
        }
        
        this.updateBlocChoice( blocId );
    },
    
    getSelection: function()
    {
        var self = this,
            selection = null;
        
        if( this.selection.all.checked )
        {
            selection = '*';
        }
        else
        {
            selection = {};
            
            Object.each( self.selection.blocuri, function( blocId, blocSelection )
            {
                if( blocSelection.checked )
                {
                    if( selection.blocuri === undefined )
                    {
                        selection.blocuri = [];
                    }
                    
                    selection.blocuri.push( blocId );
                }
                else
                {
                    var scariBloc = self.StructuraData.getScari( blocId );
                    
                    scariBloc.each( function( scaraData )
                    {
                        var scaraId = scaraData.id;
                        
                        if( self.selection.scari[ scaraId ].checked )
                        {
                            if( selection.scari === undefined )
                            {
                                selection.scari = [];
                            }

                            selection.scari.push( scaraId );
                        }
                        else 
                        {
                            var spatiiSelection = self.selection.scari[ scaraId ].spatiiSelection;
                            
                            if( Object.isArray( spatiiSelection ) )
                            {
                                if( selection.spatii === undefined )
                                {
                                    selection.spatii = [];
                                }

                                selection.spatii.add( spatiiSelection );
                            }
                        }
                    });
                }
            });
        }
        
        return selection;
    },
    
    setSelection: function( selection )
    {
        this.clearSelection();
        
        if( selection === '*' )
        {
            this.checkAllChoice();
        }
        else if( Object.isObject( selection ) )
        {
            if( Object.isArray( selection.spatii ) )
            {
                this.setSpatiiSelection( selection.spatii );
            }
            
            if( Object.isArray( selection.scari ) )
            {
                this.setScariSelection( selection.scari );
            }
            
            if( Object.isArray( selection.blocuri ) )
            {
                this.setBlocuriSelection( selection.blocuri );
            }
        }
    },
    
    getData: function()
    {
        return Object.clone( this.selection );
    },
    
    getBlocId: function( scaraId )
    {
        var blocId = this.StructuraData.getScaraInfo( scaraId ).bloc_id;
        
        return blocId;
    },
    
    setupSelection: function()
    {
        var blocuri = {},
            scari = {};
        
        this.StructuraData.getBlocuri().each( function( blocData )
        {
            blocData.scari.each( function( scaraData )
            {
                scari[ scaraData.id ] = {
                    checked:            true,
                    indeterminate:      false,
                    spatiiSelection:    '*'
                };
            });
            
            blocuri[ blocData.id ] = {
                checked:        true,
                indeterminate:  false
            };
        });
        
        this.selection = {
            all: {
                checked:        true,
                indeterminate:  false
            },
            blocuri: blocuri,
            scari: scari
        };
    },

    clearSelection: function()
    {
        this.uncheckAllChoice();
    },

    checkAllChoice: function( propagate )
    {
        this.selection.all.checked          = true;
        this.selection.all.indeterminate    = false;
        
        propagate = propagate === undefined ? 
            true :
            Object.toBoolean( propagate );
        
        if( propagate )
        {
            this.checkBlocChoices();
        }
    },

    uncheckAllChoice: function( propagate )
    {
        this.selection.all.checked          = false;
        this.selection.all.indeterminate    = false;
        
        propagate = propagate === undefined ? 
            true :
            Object.toBoolean( propagate );
        
        if( propagate )
        {
            this.uncheckBlocChoices();
        }
    },

    partialCheckAllChoice: function()
    {
        this.selection.all.checked = false;
        this.selection.all.indeterminate = true;
    },

    checkBlocChoice: function( blocId, propagate )
    {
        if( !this.selection.blocuri[ blocId ] )
        {
            System.exception( ExceptionCodes.UNEXPECTED_VALUE, { argument: 'blocId' } );
        }
        
        this.selection.blocuri[ blocId ].checked        = true;
        this.selection.blocuri[ blocId ].indeterminate  = false;
        
        propagate = propagate === undefined ? 
            true :
            Object.toBoolean( propagate );
        
        if( propagate )
        {
            this.checkScaraChoices( blocId );
        }
    },
    
    uncheckBlocChoice: function( blocId, propagate )
    {
        if( !this.selection.blocuri[ blocId ] )
        {
            System.exception( ExceptionCodes.UNEXPECTED_VALUE, { argument: 'blocId' } );
        }
        
        this.selection.blocuri[ blocId ].checked        = false;
        this.selection.blocuri[ blocId ].indeterminate  = false;
        
        propagate = propagate === undefined ? 
            true :
            Object.toBoolean( propagate );
        
        if( propagate )
        {
            this.uncheckScaraChoices( blocId );
        }
    },
    
    partialCheckBlocChoice: function( blocId )
    {
        if( !this.selection.blocuri[ blocId ] )
        {
            System.exception( ExceptionCodes.UNEXPECTED_VALUE, { argument: 'blocId' } );
        }
        
        this.selection.blocuri[ blocId ].checked        = false;
        this.selection.blocuri[ blocId ].indeterminate  = true;
    },
    
    checkBlocChoices: function()
    {
        var self = this;
        
        Object.each( this.selection.blocuri, function( blocId )
        {
            self.checkBlocChoice( blocId );
        });
    },
    
    uncheckBlocChoices: function()
    {
        var self = this;
        
        Object.each( this.selection.blocuri, function( blocId )
        {
            self.uncheckBlocChoice( blocId );
        });
    },
    
    checkScaraChoice: function( scaraId )
    {
        if( !this.selection.scari[ scaraId ] )
        {
            System.exception( ExceptionCodes.UNEXPECTED_VALUE, { argument: 'scaraId' } );
        }
        
        this.selection.scari[ scaraId ].checked = true;
        this.selection.scari[ scaraId ].indeterminate = false;
        this.selection.scari[ scaraId ].spatiiSelection = '*';
    },
    
    uncheckScaraChoice: function( scaraId )
    {
        if( !this.selection.scari[ scaraId ] )
        {
            System.exception( ExceptionCodes.UNEXPECTED_VALUE, { argument: 'scaraId' } );
        }
        
        this.selection.scari[ scaraId ].checked = false;
        this.selection.scari[ scaraId ].indeterminate = false;
        this.selection.scari[ scaraId ].spatiiSelection = null;
    },
    
    partialCheckScaraChoice: function( scaraId, spatiiSelection )
    {
        if( !this.selection.scari[ scaraId ] )
        {
            System.exception( ExceptionCodes.UNEXPECTED_VALUE, { argument: 'scaraId' } );
        }
        
        this.selection.scari[ scaraId ].checked = false;
        this.selection.scari[ scaraId ].indeterminate = true;
        this.selection.scari[ scaraId ].spatiiSelection = spatiiSelection;
    },
    
    checkScaraChoices: function( blocId )
    {
        var self = this,
            scari = this.StructuraData.getScari( blocId );
        
        scari.each( function( scaraData )
        {
            var scaraId = scaraData.id;
            
            self.checkScaraChoice( scaraId );
        });
    },
    
    uncheckScaraChoices: function( blocId )
    {
        var self = this,
            scari = this.StructuraData.getScari( blocId );
        
        scari.each( function( scaraData )
        {
            var scaraId = scaraData.id;
            
            self.uncheckScaraChoice( scaraId );
        });
    },
    
    updateAllChoice: function()
    {
        var allBlocuriChecked = true,
            allBlocuriUnchecked = true;

        Object.each( this.selection.blocuri, function( blocId, selection )
        {
            if( !selection.checked )
            {
                allBlocuriChecked = false;
            }

            if( selection.checked || selection.indeterminate )
            {
                allBlocuriUnchecked = false;
            }
        });

        if( allBlocuriChecked )
        {
            this.checkAllChoice( false );
        }
        else if( !allBlocuriUnchecked )
        {
            this.partialCheckAllChoice();
        }
        else
        {
            this.uncheckAllChoice( false );
        }
    },
    
    updateBlocChoice: function( blocId )
    {
        var self = this,
            allScariChecked = true,
            allScariUnchecked = true,
            scari = this.StructuraData.getScari( blocId );

        scari.each( function( scaraData )
        {
            var scaraId = scaraData.id,
                selection =  self.selection.scari[ scaraId ];
            
            if( !selection.checked )
            {
                allScariChecked = false;
            }

            if( selection.checked || selection.indeterminate )
            {
                allScariUnchecked = false;
            }
        });

        if( allScariChecked )
        {
            this.checkBlocChoice( blocId, false );
        }
        else if( !allScariUnchecked )
        {
            this.partialCheckBlocChoice( blocId );
        }
        else
        {
            this.uncheckBlocChoice( blocId );
        }
        
        this.updateAllChoice();
    },
    
    getSpatiiScaraSelection: function( scaraId )
    {
        return this.selection.scari[ scaraId ].spatiiSelection;
    },
    
    setSpatiiScaraSelection: function( scaraId, selection )
    {
        if( selection === '*' )
        {
            this.checkScaraChoice( scaraId );
        }
        else if( Object.isArray( selection ) && selection.length )
        {
            this.partialCheckScaraChoice( scaraId, selection );
        }
        else
        {
            this.uncheckScaraChoice( scaraId );
        }
        
        var blocId = this.getBlocId( scaraId );
        
        this.updateBlocChoice( blocId );
    },
    
    setSpatiiSelection: function( spatii )
    {
        // grupare spatii dupa scara de care apartin
        var self = this,
            scariGroups = {};
        
        spatii.each( function( spatiuId )
        {
            var scaraId = self.StructuraData.getSpatiuInfo( spatiuId ).scara_id;
            
            if( scariGroups[ scaraId ] === undefined )
            {
                scariGroups[ scaraId ] = [];
            }
            
            scariGroups[ scaraId ].push( spatiuId );
        });
        
        Object.each( scariGroups, function( scaraId, spatiiScara )
        {
            self.setSpatiiScaraSelection( scaraId, spatiiScara );
        });
    },
    
    setScariSelection: function( scari )
    {
        var self = this;
        
        scari.each( function( scaraId )
        {
            self.toggleScaraChoice( scaraId );
        });
    },
    
    setBlocuriSelection: function( blocuri )
    {
        var self = this;
        
        blocuri.each( function( blocId )
        {
            self.toggleBlocChoice( blocId );
        });
    }
    
});

//------------------------------------------------------------------------------

var SuprafataSelectionConstructor = __SelectionAbstract.extend(
{
    _setup_: function()
    {
        this.parametruSpatii = 'suprafata';
    }
});

//------------------------------------------------------------------------------

var PersoaneSelectionConstructor = __SelectionAbstract.extend(
{
    _setup_: function()
    {
        this.parametruSpatii = 'persoane';
    }
});

//==============================================================================

var RepartizareScaraClass = _Components.Container.extend(
{
    __interface: [ 'getRepartizare', 'setRepartizare', 'setScara', 'getScara' ],
    __events: [ 'select' ],
    
    _setup_: function()
    {
        this.readOnly       = Object.toBoolean( this.getOption( 'readOnly' ) );
        
        if( !this.readOnly )
        {
            this._setRequiredOptions( [ 'parametru' ] );
        }
        
        // this._setRequiredOptions( [ 'scaraId' ] );
        
        this.scaraId        = null;
        this.repartizare    = '*';
        
        this.StructuraData  = DataResource.get( 'Structura' );
    },
    
    _setupElements_: function()
    {
        this.$summary = this.find( '.summary' );
        
        if( !this.readOnly )
        {
            this.$selecteSpatiiButton = this.find( '.select-spatii-button' );
        }
        
        this.$denumireScara = this.find( '.denumire-scara' );
    },
    
    _setupActions_: function()
    {
        if( !this.readOnly )
        {
            this.bindSelectSpatiiButtonAction();
        }
    },

    _init_: function()
    {
        // this.setRepartizare( this.getOption( 'repartizare' ) );
    },

    _parameters_: function( params )
    {
        if( params.scaraId )
        {
            this.setScara( params.scaraId );
        }
    },

    _reset_: function()
    {
        this.setRepartizare( '*' );
    },
    
    bindSelectSpatiiButtonAction: function()
    {
        var self = this;
        
        this.$selecteSpatiiButton.on( 'click', function()
        {
            if( !self.scaraId )
            {
                System.exception( ExceptionCodes.UNDEFINED_PARAMETER, { parameter: 'scaraId' } );
            }
            
            var selection = self.getRepartizare();
           
            _Cheltuieli.SelectSpatiiDialog.getInstance().open({
                scaraId:    self.scaraId,
                parametru:  self.getOption( 'parametru' ),
                selection:  selection,
                onSelect:   function( selection )
                {
                    self.setRepartizare( selection );
                    self._trigger( 'select', selection );
                }
            });
        });
    },
    
    setRepartizare: function( repartizare )
    {
        this.repartizare = null;
        
        if( Object.isObject( repartizare ) )
        {
            if( Object.isArray( repartizare.spatii ) )
            {
                this.repartizare = this.filterSpatii( repartizare.spatii );
            }
            
            if( Object.isArray( repartizare.scari ) && repartizare.scari.contains( this.getScara() ) )
            {
                this.repartizare = '*';
            }
        }
        else if( Object.isArray( repartizare ) )
        {
            this.repartizare = this.filterSpatii( repartizare );
        }
        else if( repartizare === '*' )
        {
            this.repartizare = '*';
        }
        
        var summary = this.getRepartizareSummary();
        
        this.$summary.text( summary );
    },
    
    filterSpatii: function( spatii )
    {
        var self = this,
            filteredSpatii = [];
        
        Object.each( spatii, function( i, spatiuId )
        {
            var scaraId = self.StructuraData.getSpatiu( spatiuId ).scara_id;
            
            if( scaraId == self.getScara() )
            {
                filteredSpatii.add( spatiuId );
            }
        });
        
        return filteredSpatii;
    },
    
    getRepartizare: function()
    {
        return this.repartizare;
    },
    
    getRepartizareSummary: function()
    {
        if( !this.scaraId )
        {
            System.exception( ExceptionCodes.UNDEFINED_PARAMETER, { parameter: 'scaraId' } );
        }

        var summary = this.constructor.getSummary({
            scaraId:        this.getScara(),
            shortSummary:   this.getOption( 'shortSummary' ),
            scaraSuffix:    this.getOption( 'scaraSuffix' ),
            repartizare:    this.getRepartizare()
        });
        
        return summary;
    },
    
    setScara: function( scaraId )
    {
        this.scaraId = scaraId;
        this.setDenumireScara();
        
        this.setRepartizare( '*' );
    },
    
    setDenumireScara: function()
    {
        if( this.scaraId && this.$denumireScara.size() )
        {
            var denumireScara = this.StructuraData.getDenumireScara( this.scaraId );
            
            this.$denumireScara.text( denumireScara + ': ' );
        }
    },
    
    getScara: function()
    {
        return this.scaraId;
    }
    
});

RepartizareScaraClass.getSummary = function( params )
{
    params = Object.makeObject( params );
    
    if( params.scaraId === undefined )
    {
        System.exception( ExceptionCodes.UNDEFINED_PARAMETER, { parameter: 'scaraId' } );
    }
    
    var defaults = {
        shortSummary: false,
        scaraSuffix: true
    };
    
    params = Object.extend( defaults, params );
    
    var summary = '',
        totalSpatii = DataResource.get( 'Structura' ).getSpatiiCount( params.scaraId ),
        scaraTextSuffix = params.shortSummary ?
                '/' + totalSpatii + ' ap.' :
                String.pluralize( totalSpatii, 'ap.', 'ap.' ) + ( params.scaraSuffix ? ' ale scării' : '' );

    if( Object.isArray( params.repartizare ) && Object.size( params.repartizare ) )
    {
        summary = params.shortSummary ?
                params.repartizare.length :
                params.repartizare.length + ' din cele ';
    }
    else if( Object.isObject( params.repartizare ) && Object.isArray( params.repartizare.spatii ) && Object.size( params.repartizare.spatii ) )
    {
        summary = params.shortSummary ?
                params.repartizare.spatii.length :
                params.repartizare.spatii.length + ' din cele ';
    }
    else if( params.repartizare === '*' ||
             ( Object.isObject( params.repartizare ) && Object.isArray( params.repartizare.scari ) && params.repartizare.scari.contains( params.scaraId ) ) )
    {
        summary = params.shortSummary ?
                totalSpatii :
                'toate cele ';
    }
    else if( Object.isEmpty( params.repartizare ) )
    {
        summary = params.shortSummary ?
                '0' :
                'niciunul din cele ';
    }

    summary += scaraTextSuffix;

    return summary;
};

//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

_Cheltuieli.RepartizareAsociatie    = RepartizareAsociatieClass;
_Cheltuieli.RepartizareScara        = RepartizareScaraClass;

})();
