(function(){

var SpatiiPanelClass = _Components.Container.extend(
{
    __interface: [ 'render', 'getSelection', 'setNote' ],
    
    _setup_: function()
    {
        this.renderMode         = null;
        this.viewMode           = null;
        
        this.SpatiiListComponents = {};
    },
    
    _setupResources_: function()
    {
        this.ViewRenderer       = new ViewRendererClass( this );
        this.OperationManager   = new OperationManagerClass( this );
        this.ParametriRenderer  = new ParametriRendererClass( this );
        this.NotesRenderer      = new NotesRendererClass( this );
    },
    
    _init_: function()
    {
        this.prepareSpatiiListComponents();
    },
    
    _reset_: function()
    {
        this.NotesRenderer.reset();
    },
    
    /**
     * 
     * @option viewMode [required] = "all" | "scara"
     * @option viewParams [optional]
     * @option operatingMode [required] = "list" | "input" | "select"
     * @option operatingParams [optional]
     * @option showSpatii [optional] = Array { spatiuId }
     * @option parametruSpatii [required] = [ "suprafata" | "persoane" ]
     * @option valoriSpatii = Object { spatiuId: valoareSpatiu }
     */
    render: function( options )
    {
        this.reset();
        
        if( options.viewMode === undefined )
        {
            System.exception( ExceptionCodes.UNDEFINED_PARAMETER, { parameter: 'viewMode' } );
        }
        this.setViewMode( options.viewMode, options.viewParams );
        
        if( options.operatingMode === undefined )
        {
            System.exception( ExceptionCodes.UNDEFINED_PARAMETER, { parameter: 'operatingMode' } );
        }
        
        Object.makeObject( options.operatingParams );
        options.operatingParams.multipleScari = ( options.viewMode == 'all' );
        
        this.setOperatingMode( options.operatingMode, options.operatingParams );
        
        if( options.showSpatii !== undefined )
        {
            this.showSpatii( options.showSpatii );
        }
        
        if( options.parametruSpatii === undefined )
        {
            System.exception( ExceptionCodes.UNDEFINED_PARAMETER, { parameter: 'parametruSpatii' } );
        }
        this.setParametruSpatii( options.parametruSpatii );
        
        if( options.valoriSpatii !== undefined )
        {
            this.setValoriSpatii( options.valoriSpatii );
        }
        
        if( options.notes !== undefined )
        {
            if( !Object.isArray( options.notes ) )
            {
                System.exception( ExceptionCodes.INVALID_ARGUMENT, { argument: 'option.notes', type: 'Array' } );
            }
            
            this.setNote.apply( this, options.notes );
        }
    },
    
    prepareSpatiiListComponents: function()
    {
        var self = this;
        
        DataResource.get( 'Structura' ).getScari().each( function( scaraData )
        {
            var $scaraContainer = self._getTemplate( 'spatii-list-component' ),
                scaraId = scaraData.id;
            
            self.SpatiiListComponents[ scaraId ] = new _Spatii.SpatiiList( $scaraContainer, { scaraId: scaraId } );
        });
    },
    
    getList: function( scaraId )
    {
        return this.SpatiiListComponents[ scaraId ];
    },
    
    getRenderedLists: function()
    {
        return this.ViewRenderer.getRenderedLists();
    },
    
    getAllLists: function()
    {
        return this.SpatiiListComponents;
    },
    
    getSelection: function( returnType )
    {
        return this.OperationManager.action( 'getSelection', returnType );
    },
    
    setViewMode: function( viewMode, options )
    {
        this.ViewRenderer.setView( viewMode, options );
    },
    
    showSpatii: function( spatii )
    {
        this.ViewRenderer.showSpatii( spatii );
    }, 
    
    setParametruSpatii: function( parametru )
    {
        this.ParametriRenderer.setParametru( parametru );
    },
    
    setOperatingMode: function( mode, options )
    {
        this.OperationManager.setOperation( mode, options );
    },
    
    setValoriSpatii: function( valori )
    {
        this.ParametriRenderer.setValori( valori );
    },
    
    setNote: function( note, spatii, cell )
    {
        this.NotesRenderer.display( note, spatii, cell );
    },
    
    appendNote: function( note, spatii, cell )
    {
        this.NotesRenderer.append( note, spatii, cell );
    }
    
});

SpatiiPanelClass.RETURN_SPATII_LIST = 'rsl';
SpatiiPanelClass.RETURN_OBJECT = 'ro';

//==============================================================================

var ViewRendererClass = _Components.Class.extend(
{
    __interface: [ 'setView', 'showSpatii', 'getRenderedLists' ],
    
    init: function( Context )
    {
        this._viewClasses = {
            all:        ContinuousViewRendererClass,
            scara:      ScaraViewRendererClass
        };
        
        this.Context = Context;
        this.Worker = {};
        this.viewMode = null;
    },
    
    setView: function( viewMode, options )
    {
        if( this._viewClasses[ viewMode ] === undefined )
        {
            System.exception( ExceptionCodes.UNEXPECTED_VALUE, { argument: 'viewMode', value: viewMode } );
        }
        
        if( this.Worker[ viewMode ] === undefined )
        {
            this.Worker[ viewMode ] = new ( this._viewClasses[ viewMode ] )( this.Context );
        }
        
        this.Worker[ viewMode ].render( options );
        
        this.viewMode = viewMode;
    },
    
    showSpatii: function( spatii )
    {
        this.Worker[ this.viewMode ] && this.Worker[ this.viewMode ].showSpatii( spatii );
    },
    
    getRenderedLists: function()
    {
        var Lists = this.Worker[ this.viewMode ] ?
                this.Worker[ this.viewMode ].getRenderedLists() :
                [];
            
        return Lists;
    }
    
});

//------------------------------------------------------------------------------

var __ViewModeClass = _Components.Container.extend(
{
    __interface:    [ 'render', 'getRenderedLists', 'showSpatii' ],
    
    __abstract:     [ 'generateScaraContainer' ],
    
    _setup_: function()
    {
        this.renderedLists = [];
    },
    
    emptyContainer: function()
    {
        Object.each( this.Context.getAllLists(), function( scaraId, SpatiiList )
        {
            SpatiiList.getContainer().detach();
        });
        
        this.Context.getContainer().empty();
        this.renderedLists = [];
    },
    
    getList: function( scaraId )
    {
        return this.Context.getList( scaraId );
    },
    
    getRenderedLists: function()
    {
        return this.renderedLists;
    },
    
    /**
     * @param 
     *      Array - lista cu ID-urile spatiilor
     *      Object = {blocuri, scari, spatii}
     *      String = '*' - toate spatiile
     */
    showSpatii: function( spatii )
    {
        var Lists = this.getRenderedLists();
        
        if( spatii === '*' || spatii === undefined )
        {
            Lists.each( function( List )
            {
                List.showAllRows();
            });
        }
        else if( Object.isObject( spatii ) )
        {
            Lists.each( function( List )
            {
                List.getSpatiuRows().each( function()
                {
                    var $row = $(this),
                        spatiuData = $row.data( 'data' ),
                        spatiuId = spatiuData.id.toString(),
                        scaraId = spatiuData.scara_id.toString(),
                        blocId = spatiuData.bloc_id.toString();
                        
                    if( ( spatii.blocuri && spatii.blocuri.contains( blocId ) )
                            || 
                        ( spatii.scari && spatii.scari.contains( scaraId ) )
                            || 
                        ( spatii.spatii && spatii.spatii.contains( spatiuId ) ) )
                    {
                        List.showRow( $row );
                    }
                    else
                    {
                        List.hideRow( $row );
                    }
                });
            });
        }
        else if( Object.isArray( spatii ) )
        {
            Lists.each( function( List )
            {
                List.getSpatiuRows().each( function()
                {
                    var $row = $(this),
                        spatiuData = $row.data( 'data' ),
                        spatiuId = spatiuData.id;
                        
                    if( spatii && spatii.contains( spatiuId ) )
                    {
                        List.showRow( $row );
                    }
                    else
                    {
                        List.hideRow( $row );
                    }
                });
            });
        }
        
        this.refresh();
    }
    
});

//------------------------------------------------------------------------------

var ContinuousViewRendererClass = __ViewModeClass.extend(
{
    render: function()
    {
        var self = this;
        
        this.emptyContainer();
        
        this.getScari().each( function( scaraData )
        {
            var SpatiiList = self.getList( scaraData.id ),
                $scaraContainer = self.generateScaraContainer( scaraData );
            
            $scaraContainer.appendTo( self.Context.getContainer() );
            
            self.renderedLists.push( SpatiiList );
        });
    },
    
    getScari: function()
    {
        var scari = DataResource.get( 'Structura' ).getScari();
            
        return scari;
    },
    
    generateScaraContainer: function( scaraData )
    {
        var $container = this._getTemplate( 'continuous-view' ),
            denumireBloc = DataResource.get( 'Structura' ).getBlocInfo( scaraData.bloc_id ).denumire,
            denumireScara = scaraData.denumire,
            scaraId = scaraData.id,
            $spatiiListContainer = this.getList( scaraId ).getContainer();
        
        $container.data( 'scara_id', scaraId );
        
        $container.find( '.denumire-bloc' ).text( denumireBloc );
        $container.find( '.denumire-scara' ).text( denumireScara );
        $container.find( '.scara-content' ).html( $spatiiListContainer );
        
        return $container;
    },
    
    _refresh_: function()
    {
        this.hideEmptyContainers();
    },
    
    hideEmptyContainers: function()
    {
        var self = this;
        
        this.Context.getContainer().children().each( function()
        {
            var $container = $(this),
                scaraId = $container.data( 'scara_id' ),
                SpatiiList = self.getList( scaraId );
            
            if( !SpatiiList.getTotalSpatii() )
            {
                $container.hide();
            }
        });
    }
    
});

//------------------------------------------------------------------------------

var ScaraViewRendererClass = __ViewModeClass.extend(
{
    render: function( options )
    {
        this.emptyContainer();
        
        options = Object.makeObject( options );
        
        if( options.scaraId === undefined )
        {
            System.exception( ExceptionCodes.UNDEFINED_PARAMETER, { parameter: 'scaraId' } );
        }
        
        var scaraId = options.scaraId,
            SpatiiList = this.getList( scaraId ),
            scaraData = DataResource.get( 'Structura' ).getScaraInfo( scaraId ),
            $scaraContainer = this.generateScaraContainer( scaraData );

        $scaraContainer.appendTo( this.Context.getContainer() );
        
        this.renderedLists.push( SpatiiList );
    },
    
    generateScaraContainer: function( scaraData )
    {
        var $container = this._getTemplate( 'scara-view' ),
            scaraId = scaraData.id,
            $spatiiListContainer = this.getList( scaraId ).getContainer();
        
        $container.html( $spatiiListContainer );
        
        return $container;
    }
    
});

//==============================================================================

var OperationManagerClass = _Components.Class.extend(
{
    __interface: [ 'setOperation' ],
    
    init: function( Context )
    {
        this._workerClasses = {
            list:       ListOperationClass,
            input:      InputOperationClass,
            select:     SelectOperationClass
        };

        this.Context = Context;
        this.Worker = {};
        this.operationMode = null;
    },
    
    setOperation: function( operationMode, options )
    {
        if( this._workerClasses[ operationMode ] === undefined )
        {
            System.exception( ExceptionCodes.UNEXPECTED_VALUE, { argument: 'operationMode' } );
        }
        
        if( this.Worker[ operationMode ] === undefined )
        {
            this.Worker[ operationMode ] = new ( this._workerClasses[ operationMode ] )( this.Context );
        }
        
        options = Object.makeObject( options );
        this.Worker[ operationMode ].run( options );
        
        this.operationMode = operationMode;
    },
    
    action: function( action, arg_N )
    {
        var Worker = this.Worker[ this.operationMode ];
                
        if( Worker )
        {
            return Worker.action.apply( Worker, arguments );
        }
    }
    
});

//------------------------------------------------------------------------------

var __OperationClass = _Components.Container.extend(
{
    __interface: [ 'run', 'action' ],
    
    __abstract: [ '_run' ],
    
    eventsNamespace: 'operation',
    
    _setup_: function()
    {
        this.options = {};
    },
    
    run: function( options )
    {
        this.options = Object.makeObject( options );
        
        this.disableEvents();
        this.reset();
        this._run( options );
    },
    
    action: function( action )
    {
        var actionMethod = this[ action + 'Action' ];
        
        if( Object.isFunction( actionMethod ) )
        {
            var args = Array.create( arguments ).from( 1 );
            
            return actionMethod.apply( this, args );
        }
        else
        {
            System.exception( ExceptionCodes.CUSTOM, { message: 'Action not supported: {action}'.assign( { action: action } ) } );
        }
    },
    
    disableEvents: function()
    {
        var self = this;
        
        this.iterateLists( function()
        {
            this.getContainer().off( '.' + self.eventsNamespace );
        });
    },
    
    getLists: function()
    {
        var SpatiiListComponents = this.Context.getRenderedLists();
        
        return SpatiiListComponents;
    },
    
    getList: function( scaraId )
    {
        var SpatiiList = this.Context.getList( scaraId );
        
        return SpatiiList;
    },
    
    iterateLists: function( operation )
    {
        this.getLists().each( function( SpatiiList )
        {
            operation.call( SpatiiList );
        });
    },
    
    bindEvent: function( event, selector, handler )
    {
        event = event + '.' + this.eventsNamespace;
        
        this.iterateLists( function()
        {
            this.bind( event, selector, { SpatiiList: this }, handler );
        });
    }
    
});

//------------------------------------------------------------------------------

var ListOperationClass = __OperationClass.extend(
{
    _run: function( options )
    {
        if( Object.isBlank( options.headerTitle ) )
        {
            System.exception( ExceptionCodes.UNDEFINED_PARAMETER, { parameter: 'headerTitle' } );
        }
        
        this.iterateLists( function()
        {
            this.find( '.select-cell' ).hide();
            this.find( '.suma-cell' ).hide();
        });
        
        this.getContainer().removeClass( 'selectable' );
        
        this.setCellHeader( options.headerTitle );
    },
    
    setCellHeader: function( header )
    {
        this.iterateLists( function()
        {
            this.getListHeader().find( '.suma-cell' ).text( header );
        });
    }
    
});

//------------------------------------------------------------------------------

var SelectOperationClass = __OperationClass.extend(
{
    _setup_: function()
    {
        this.scariSelection = {};
    },
    
    _reset_: function()
    {
        this.scariSelection = {};
        this.deselectAllRows();
    },
    
    _run: function( options )
    {
        this.iterateLists( function()
        {
            this.find( '.select-cell' ).show();
            this.find( '.suma-cell' ).hide();
        });
        
        this.getContainer().addClass( 'selectable' );
        
        this.bindActions();
        
        this.setSelection( options.selection );
    },
    
    bindActions: function()
    {
        var self = this;
        
        this.bindEvent( 'click', '.select-all-button', function( event )
        {
            self.selectAllRows( event.data.SpatiiList );
        });
        
        this.bindEvent( 'click', '.deselect-all-button', function( event )
        {
            self.deselectAllRows( event.data.SpatiiList );
        });

        this.bindEvent( 'click', '.spatiu-row', function( event )
        {
            var $row = $(this);
            
            self.toggleRow( event.data.SpatiiList, $row );
        });

        this.bindEvent( 'mouseenter', '.etaj-container >.etaj-cell', function( event )
        {
            var $etajCell = $(this),
                $etajContainer =  event.data.SpatiiList.getEtajContainerOfElement( $etajCell );

            $etajContainer.addClass( 'hover' );
        });

        this.bindEvent( 'mouseleave', '.etaj-container >.etaj-cell', function( event )
        {
            var $etajCell = $(this),
                $etajContainer =  event.data.SpatiiList.getEtajContainerOfElement( $etajCell );

            $etajContainer.removeClass( 'hover' );
        });

        this.bindEvent( 'click', '.etaj-container >.etaj-cell', function( event )
        {
            var SpatiiList  = event.data.SpatiiList,
                $etajCell   = $(this),
                $etajContainer = SpatiiList.getEtajContainerOfElement( $etajCell ),
                $rows       = SpatiiList.filterVisibleRows( SpatiiList.getSpatiuRowsInsideContainer( $etajContainer ) ),
                allSelected = true;

            $rows.each( function()
            {
                var $row = $(this);

                if( !self.isRowSelected( SpatiiList, $row ) )
                {
                    allSelected = false;

                    return false;
                }
            });

            if( allSelected )
            {
                $rows = self.getSelectedRows( SpatiiList, $rows );
                self.deselectRow( SpatiiList, $rows );
            }
            else
            {
                $rows = self.getNotSelectedRows( SpatiiList, $rows );
                self.selectRow( SpatiiList, $rows );
            }
        });
    },
    
    getSelectionAction: function( returnType )
    {
        var selection;
        
        if( returnType === SpatiiPanelClass.RETURN_SPATII_LIST )
        {
            selection = this.getSelectionAsList();
        }
        else
        {
            selection = this.getSelectionAsObject();
        }
        
        return selection;
    },

    getSelectionAsObject: function()
    {
        var self = this,
            selection;
    
        if( Object.size( this.scariSelection ) === 0 )
        {
            selection = null;
        }
        else
        {
            selection = {};

            Object.each( this.scariSelection, function( scaraId, scaraSelection )
            {
                var selectedSpatiiCount = Object.size( scaraSelection );
                
                if( !selectedSpatiiCount )
                {
                    return false;
                }
                if( selectedSpatiiCount == self.getList( scaraId ).getSpatiiCount() )
                {
                    if( selection.scari === undefined )
                    {
                        selection.scari = [];
                    }

                    selection.scari.push( scaraId );
                }
                else
                {
                    if( selection.spatii === undefined )
                    {
                        selection.spatii = [];
                    }

                    selection.spatii.add( Object.keys( scaraSelection ) );
                }
            });

            if( selection.scari )
            {
                var StructuraData = DataResource.get( 'Structura' );

                StructuraData.getBlocuri().each( function( blocData )
                {
                    var blocId = blocData.id,
                        scariList = StructuraData.getScariIds( blocId );

                    if( scariList.subtract( selection.scari ).length == 0 )
                    {
                        if( selection.blocuri === undefined )
                        {
                            selection.blocuri = [];
                        }

                        selection.blocuri.push( blocId );
                        selection.scari = selection.scari.subtract( scariList );
                    }
                });

                if( selection.blocuri )
                {
                    if( StructuraData.getBlocuriIds().subtract( selection.blocuri ).length == 0 )
                    {
                        selection = '*';
                    }
                }
            }
        }
        
        return selection;
    },

    getSelectionAsList: function()
    {
        var selection;
    
        if( Object.size( this.scariSelection ) === 0 )
        {
            selection = null;
        }
        else
        {
            selection = [];

            Object.each( this.scariSelection, function( scaraId, scaraSelection )
            {
                selection.add( Object.keys( scaraSelection ) );
            });
            
            if( this.options.multipleScari == false 
                && Object.size( this.getLists() ) == 1 
                && Object.size( selection ) )
            {
                var scaraId = Object.keys( this.scariSelection )[ 0 ],
                    spatiiScaraCount = DataResource.get( 'Structura' ).getSpatiiCount( scaraId );
                
                if( Object.size( selection ) == spatiiScaraCount )
                {
                    selection = '*';
                }
            }
        }
        
        return selection;
    },
    
    /**
     * 
     * @param selection 
     *  - Object {spatii, scari, blocuri}
     *  - Array [spatiuId]
     */
    setSelection: function( selection )
    {
        var self = this;

        this.deselectAllRows();
        
        if( selection === '*' )
        {
            this.selectAllRows();
        }
        else if( Object.isObject( selection ) )
        {
            this.iterateLists( function()
            {
                var SpatiiList = this;
                
                if( selection.blocuri )
                {
                    selection.blocuri.each( function( blocId )
                    {
                        if( SpatiiList.getBlocId() == blocId )
                        {
                            self.selectAllRows( SpatiiList );
                        }
                    });
                }
                
                if( selection.scari )
                {
                    selection.scari.each( function( scaraId )
                    {
                        if( SpatiiList.getScaraId() == scaraId )
                        {
                            self.selectAllRows( SpatiiList );
                        }
                    });
                }
                
                if( selection.spatii )
                {
                    selection.spatii.each( function( spatiuId )
                    {
                        var $row = SpatiiList.getSpatiuRow( spatiuId );

                        self.selectRow( SpatiiList, $row );
                    });
                }
            });
        }
        else if( Object.isArray( selection ) )
        {
            this.iterateLists( function()
            {
                var SpatiiList = this;
                
                selection.each( function( spatiuId )
                {
                    var $row = SpatiiList.getSpatiuRow( spatiuId );

                    self.selectRow( SpatiiList, $row );
                });
            });
        }
    },
    
    selectRow: function( SpatiiList, $row )
    {
        var self = this,
            scaraId = SpatiiList.getScaraId();
        
        $row.each( function()
        {
            var $r = $(this),
                spatiuId;
                
            if( SpatiiList.isRowVisible( $r ) )
            {
                spatiuId = SpatiiList.getSpatiuId( $r );
                
                if( self.scariSelection[ scaraId ] === undefined )
                {
                    self.scariSelection[ scaraId ] = {};
                }
                
                self.scariSelection[ scaraId ][ spatiuId ] = true;

                // $r.addClass( 'selected' );
                $r.find( ':checkbox.selection' ).prop( 'checked', true );
            }
        });
        
    },
    
    deselectRow: function( SpatiiList, $row )
    {
        var self = this,
            scaraId = SpatiiList.getScaraId();
        
        $row.each( function()
        {
            var $r = $(this),
                spatiuId = SpatiiList.getSpatiuId( $r );
            
            if( self.scariSelection[ scaraId ] )
            {
                delete self.scariSelection[ scaraId ][ spatiuId ];
            }
            
            // $r.removeClass( 'selected' );
            $r.find( ':checkbox.selection' ).prop( 'checked', false );
        });
    },
    
    isRowSelected: function( SpatiiList, $row )
    {
        var spatiuId = SpatiiList.getSpatiuId( $row ),
            scaraId = SpatiiList.getScaraId();
        
        return Object.toBoolean( this.scariSelection[ scaraId ] && this.scariSelection[ scaraId ][ spatiuId ] );
    },
    
    toggleRow: function( SpatiiList, $row )
    {
        if( this.isRowSelected( SpatiiList, $row ) )
        {
            this.deselectRow( SpatiiList, $row );
        }
        else
        {
            this.selectRow( SpatiiList, $row );
        }
    },
    
    selectAllRows: function( SpatiiList )
    {
        var self = this;
        
        if( SpatiiList === undefined )
        {
            this.iterateLists( function()
            {
                self.selectRow( this, this.getAllVisibleSpatiuRows() );
            });
        }
        else
        {
            self.selectRow( SpatiiList, SpatiiList.getAllVisibleSpatiuRows() );
        }
    },
    
    deselectAllRows: function( SpatiiList )
    {
        var self = this;
        
        if( SpatiiList === undefined )
        {
            this.iterateLists( function()
            {
                self.deselectRow( this, this.getAllVisibleSpatiuRows() );
            });
        }
        else
        {
            self.deselectRow( SpatiiList, SpatiiList.getAllVisibleSpatiuRows() );
        }
    },
    
    getSelectedRows: function( SpatiiList, $rows )
    {
        var self = this;
        
        var $selectedRows = $rows.filter( function()
        {
            return self.isRowSelected( SpatiiList, $(this) );
        });
        
        return $selectedRows;
    },
    
    getNotSelectedRows: function( SpatiiList, $rows )
    {
        var self = this;
        
        var $notSelectedRows = $rows.filter( function()
        {
            return !self.isRowSelected( SpatiiList, $(this) );
        });
        
        return $notSelectedRows;
    }
        
});

//------------------------------------------------------------------------------

var InputOperationClass = __OperationClass.extend(
{
    _run: function( options )
    {
        this.iterateLists( function()
        {
            var $sumaCells = this.find( '.suma-cell' );
            
            this.find( '.select-cell' ).hide();
            
            $sumaCells.show();
            $sumaCells.find( 'input' ).show();
            $sumaCells.find( '.value' ).hide();
        });
        
        this.getContainer().removeClass( 'selectable' );
        
        if( Object.isBlank( options.headerTitle ) )
        {
            System.exception( ExceptionCodes.UNDEFINED_PARAMETER, { parameter: 'headerTitle' } );
        }
        
        this.setCellHeader( options.headerTitle );
        this.setSelection( options.selection );
    },
    
    setCellHeader: function( header )
    {
        this.iterateLists( function()
        {
            this.getListHeader().find( '.suma-cell' ).text( header );
        });
    },
    
    /**
     * 
     * @returns Object
     */
    getSelectionAction: function()
    {
        var selection = {};
        
        this.iterateLists( function()
        {
            this.getAllVisibleSpatiuRows().each( function()
            {
                var $row = $(this),
                    $input = $row.find( 'input[name=suma_spatiu]' ),
                    inputValue = $input.val().trim(),
                    spatiuData = $row.data( 'data' ),
                    spatiuId = spatiuData.id;

                if( !inputValue.isBlank() )
                {
                    selection[ spatiuId ] = inputValue;
                }
            });
        });
        
        return selection;
    },
    
    setSelection: function( selection )
    {
        var clearInput = false;
        
        if( Object.isEmpty( selection ) || !Object.isObject( selection ) )
        {
            clearInput = true;
        }
        
        this.iterateLists( function()
        {
            this.getAllVisibleSpatiuRows().each( function()
            {
                var $row = $(this),
                    $input = $row.find( 'input[name=suma_spatiu]' ),
                    spatiuData = $row.data( 'data' ),
                    spatiuId = spatiuData.id,
                    value = clearInput ? '' : selection[ spatiuId ];
                    
                $input.val( value );
            });
        });
    }

});

//==============================================================================

var ParametriRendererClass = _Components.Class.extend(
{
    __interface: [ 'setParametru', 'setValori' ],
    
    init: function( Context )
    {
        this.Context = Context;
    },
    
    setParametru: function( parametru )
    {
        var parametri = Array.create( parametru );
        
        this.getLists().each( function( List )
        {
            var $cells = List.find( '.parametru-cell' );
                    
            $cells.hide();
            
            parametri.each( function( p )
            {
                $cells.filter( '.' + p + '-cell' ).show();
            });
        });
    },
    
    setValori: function( valori )
    {
        this.getLists().each( function( List )
        {
            List.find( '.list-header .suma-cell' ).show();
            
            List.getAllVisibleSpatiuRows().each( function()
            {
                var $row = $(this),
                    spatiuId = List.getSpatiuId( $row ),
                    $sumaCell = $row.find( '.suma-cell' ),
                    formattedValue = Number.formatCurrency( valori[ spatiuId ], undefined, true );
              
                $sumaCell.show();
                $sumaCell.find( 'input' ).hide();
                
                $sumaCell.find( '.value' )
                        .show()
                        .text( formattedValue );
            });
        });
    },
    
    getLists: function()
    {
        return this.Context.getRenderedLists();
    }
});

//==============================================================================

var NotesRendererClass = _Components.Class.extend(
{
    __interface: [ 'display', 'append' ],
    
    init: function( Context )
    {
        this.Context = Context;
        
        this.$note = $( '<div class="cell-note">' );
        
        this.$notesCache = $();
    },
    
    reset: function()
    {
        this.clearNotes();
    },
    
    display: function( note, spatii, cell )
    {
        var self = this;
        
        this.getLists().each( function( List )
        {
            List.getAllVisibleSpatiuRows().each( function()
            {
                var $row = $(this),
                    spatiuId = List.getSpatiuId( $row );
                
                if( spatii.contains( spatiuId ) )
                {
                    var $cell = $row.find( '.spatiu-property-cell.' + cell + '-cell' );
                    
                    self.setNote( note, $cell );
                }
            });
        });
    },
    
    append: function( note, spatii, cell )
    {
        var self = this;
        
        this.getLists().each( function( List )
        {
            List.getAllVisibleSpatiuRows().each( function()
            {
                var $row = $(this),
                    spatiuId = List.getSpatiuId( $row );
                
                if( spatii.contains( spatiuId ) )
                {
                    var $cell = $row.find( '.spatiu-property-cell.' + cell + '-cell' );
                    
                    self.addNote( note, $cell );
                }
            });
        });
    },
    
    setNote: function( note, $cell )
    {
        var $note = $cell.find( '.cell-note' );
        
        if( !$note.size() )
        {
            $note = this.$note.clone();
            
            $note.appendTo( $cell );
            
            this.$notesCache = this.$notesCache.add( $note );
        }
        
        $note.show();
        $note.text( note );
    },
    
    addNote: function( note, $cell )
    {
        var $note = $cell.find( '.cell-note' );
        
        if( !$note.size() )
        {
            $note = this.$note.clone();
            
            $note.appendTo( $cell );
            
            this.$notesCache = this.$notesCache.add( $note );
        }
        
        $note.show();
        
        var text = $note.text();
        $note.text( text === undefined ? note : ( text + ',' + note ) );
    },
    
    getLists: function()
    {
        return this.Context.getRenderedLists();
    },
    
    clearNotes: function()
    {
        this.$notesCache
                .text( '' )
                .hide();
    }
});

//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

_Spatii.SpatiiPanel = SpatiiPanelClass;

})();