(function(){
    
var CheltuieliCurenteClass = _Components.Container.extend(
{
    _setupElements_: function()
    {
        this.$addButton = this.find( '.add-cheltuiala-button' );
        this.$list      = $( '#cheltuieli-curente-list' );
    },
    
    _setupResources_: function()
    {
        new CheltuieliFrameClass( this.$list );
    },
    
    _setupActions_: function()
    {
        this.bindAddCheltuialaButtonAction();
    },
    
    bindAddCheltuialaButtonAction: function()
    {
        this.$addButton.on( 'click', function()
        {
            Application.command( 'add-cheltuiala' );
        });
    }
    
});

//==============================================================================

var CheltuieliFrameClass = _Components.Container.extend(
{
    _setupResources_: function()
    {
        this.ListGenerator = new ListGeneratorClass( this );
        this.DetailsFrame = new DetailsFrameClass( this );
    }
    
});

//==============================================================================

var ListGeneratorClass = _Components.Container.extend(
{
    __interface: [ 'getItemId', 'collapse', 'expand' ],
    
    _setup_: function()
    {
        this.CheltuieliData = DataResource.get( 'Cheltuieli' );
    },
    
    _setupElements_: function()
    {
        this.$listEmpty     = this.find( '>.empty-list' );
        this.$listWrapper   = this.find( '>.list-wrapper' );
        this.$listContent   = this.$listWrapper.find( '>.list-content' );
        this.$listHeader    = this.$listWrapper.find( '>.list-header' );
    },
    
    _setupActions_: function()
    {
        this.setupDataResourceEvents();
    },
    
    _init_: function()
    {
        if( this.cheltuieliExist() )
        {
            this.populateList();
        }
        else
        {
            this.showEmptyMessage();
        }
    },
    
    cheltuieliExist: function()
    {
        return this.CheltuieliData.hasCheltuieliCurente();
    },
    
    showListWrapper: function()
    {
        this.$listWrapper.show();
        this.$listEmpty.hide();
    },
    
    showEmptyMessage: function()
    {
        this.$listWrapper.hide();
        this.$listEmpty.show();
    },
    
    populateList: function()
    {
        var self = this,
            cheltuieli = this.CheltuieliData.getCheltuieliCurente();
        
        cheltuieli.each( function( cheltuialaData )
        {
            self.addCheltuialaItem( cheltuialaData );
        });
    },
    
    generateCheltuialaItem: function( cheltuialaData )
    {
        var $item = this._getTemplate( 'cheltuiala-item' );
        
        this.populateItem( $item, cheltuialaData );
        
        return $item;
    },
    
    populateItem: function( $item, cheltuialaData )
    {
        var parametriCheltuiala = cheltuialaData.parametri,
            descriere = parametriCheltuiala.descriere,
            valoare = Number.formatCurrency( parametriCheltuiala.valoare, 2, true ),
            data = parametriCheltuiala.data ? Date.format( Date.DATE_WEEKDAY_SHORT_MONTH, parametriCheltuiala.data ) : '',
            explicatii = cheltuialaData.explicatii;
        
        $item.data( 'id', cheltuialaData.id );
        
        $item.find( '.descriere' ).text( descriere );
        $item.find( '.valoare' ).text( valoare );
        $item.find( '.data' ).text( data );
        $item.find( '.explicatii' ).text( explicatii );
    },
    
    getItemId: function( $item )
    {
        var id = $item.data( 'id' );
        
        return id;
    },
    
    setupDataResourceEvents: function()
    {
        var self = this;
        
        this.CheltuieliData.registerObserver({
            addCheltuiala: function( cheltuialaData, options )
            {
                self.addCheltuialaItem( cheltuialaData, options );
            },
            removeCheltuiala: function( cheltuialaId )
            {
                self.removeCheltuialaItem( cheltuialaId );
            },
            editCheltuiala: function( cheltuialaData, options )
            {
                self.editCheltuialaItem( cheltuialaData, options );
            }
        });
    },
    
    addCheltuialaItem: function( cheltuialaData, options )
    {
        options = Object.makeObject( options );
        
        var $cheltuialaItem = this.generateCheltuialaItem( cheltuialaData ),
            position = options.position,
            $items = this.getItems(),
            $target = $items.eq( position );

        if( position === undefined || position >= $items.size() || $target.size() == 0 )
        {
            $cheltuialaItem.appendTo( this.$listContent );
        }
        else
        {
            $cheltuialaItem.insertBefore( $target );
        }
        
        this.showListWrapper();
    },

    editCheltuialaItem: function( cheltuialaData, options )
    {
        options = Object.makeObject( options );
        
        var $cheltuialaItem = this.getItemById( cheltuialaData.id ),
            position = options.position,
            $items,
            $target;
    
        $cheltuialaItem.detach();
        this.populateItem( $cheltuialaItem, cheltuialaData );
        
        $items = this.getItems(),
        $target = $items.eq( position );

        if( position === undefined || position >= $items.size() || $target.size() == 0 )
        {
            $cheltuialaItem.appendTo( this.$listContent );
        }
        else
        {
            $cheltuialaItem.insertBefore( $target );
        }
    },
        
    getItems: function()
    {
        var $items = this.$listContent.children( '.cheltuiala-item' );
        
        return $items;
    },
    
    collapse: function()
    {
        var collapsedWidth = 0;
        
        this.$listWrapper.addClass( 'collapsed' );
        
        this.$listHeader.children().each( function()
        {
            var cellOuterWidth = $(this).outerWidth( true ).toNumber();

            collapsedWidth += cellOuterWidth;
        });
        
        this.$listWrapper.width( collapsedWidth );
        
        collapsedWidth = this.$listWrapper.outerWidth( true );
        
        return collapsedWidth;
    },
    
    expand: function()
    {
        this.$listWrapper.removeClass( 'collapsed' );
        this.$listWrapper.width( 'auto' );
    },
    
    getItemById: function( id )
    {
        var self = this,
            $item;
        
        $item = this.getItems().filter( function()
        {
            return self.getItemId( $(this) ) == id;
        });
        
        return $item;
    },
    
    removeCheltuialaItem: function( cheltuialaId )
    {
        var $item = this.getItemById( cheltuialaId );
        
        $item.remove();
        
        if( !this.cheltuieliExist() )
        {
            this.showEmptyMessage();
        }
    }
    
});

//==============================================================================

var DetailsFrameClass = _Components.Container.extend(
{
    _setup_: function()
    {
        this.opened = false;
        this.cheltuialaId = null;
    },
    
    _setupActions_: function()
    {
        this.bindOpenDetailsAction();
        this.bindCloseDetailsAction();
        this.setupDataResourceEvents();
    },
    
    _setupElements_: function()
    {
        this.$detailsFrame = this.find( '.details-frame' );
    },
    
    _setupResources_: function()
    {
        this.TipuriPanes = new DetailsPanesClass( this.$detailsFrame.find( '.tipuri-cheltuieli-panes-wrapper' ) );
        new RemoveCheltuialaActionClass( this.$detailsFrame, { Context: this } );
        new EditCheltuialaActionClass( this.$detailsFrame, { Context: this } );
    },
    
    _init_: function()
    {
        this.hideFrame();
    },
    
    bindOpenDetailsAction: function()
    {
        var self = this;
        
        this.bind( 'click', '.cheltuiala-item', function()
        {
            var cheltuialaId = self.Context.ListGenerator.getItemId( $(this) );
            self.openDetails( cheltuialaId );
        });
    },
    
    bindCloseDetailsAction: function()
    {
        var self = this;
        
        this.$detailsFrame.on( 'click', '.close-frame-button', function()
        {
            self.closeFrame();
        });
    },
    
    openDetails: function( cheltuialaId )
    {
        if( !this.isOpened() )
        {
            this.openFrame();
        }
        else if( this.getCurrentCheltuialaId() == cheltuialaId )
        {
            return;
        }

        this.displayDetails( cheltuialaId );
        
        this.highlightItem( cheltuialaId );
        
        this.cheltuialaId = cheltuialaId;
    },
    
    isOpened: function()
    {
        return this.opened;
    },
    
    displayDetails: function( cheltuialaId )
    {
        this.TipuriPanes.displayDetails( cheltuialaId );
    },
    
    openFrame: function()
    {
        var listGeneratorCollapsedWidth = this.Context.ListGenerator.collapse().toNumber();
        
        this.$detailsFrame.css( { left: listGeneratorCollapsedWidth + 20 } );
        this.showFrame();
    },
    
    closeFrame: function()
    {
        this.Context.ListGenerator.expand();
        this.hideFrame();
        this.Context.ListGenerator.getItems().removeClass( 'selected' );
    },
    
    showFrame: function()
    {
        this.$detailsFrame.show();
        this.opened = true;
    },
    
    hideFrame: function()
    {
        this.$detailsFrame.hide();
        this.opened = false;
        this.cheltuialaId = null;
    },
    
    highlightItem: function( cheltuialaId )
    {
        this.Context.ListGenerator.getItems().removeClass( 'selected' );
        this.Context.ListGenerator.getItemById( cheltuialaId ).addClass( 'selected' );
    },
    
    getCurrentCheltuialaId: function()
    {
        return this.cheltuialaId;
    },
    
    setupDataResourceEvents: function()
    {
        var self = this;
        
        DataResource.get( 'Cheltuieli' ).registerObserver(
        {
            removeCheltuiala: function( cheltuialaId )
            {
                if( self.getCurrentCheltuialaId() == cheltuialaId )
                {
                    self.closeFrame();
                }
            },
            editCheltuiala: function( cheltuialaData )
            {
                if( self.getCurrentCheltuialaId() == cheltuialaData.id )
                {
                    self.updateContent( cheltuialaData );
                }
            },
            addCheltuiala: function( cheltuialaData )
            {
                self.openDetails( cheltuialaData.id );
            }
        });
    },
    
    updateContent: function( cheltuialaData )
    {
        this.TipuriPanes.displayDetails( cheltuialaData.id );
    }
    
});

//==============================================================================

var RemoveCheltuialaActionClass = _Components.Container.extend(
{
    _setup_: function()
    {
        this._setRequiredOptions( [ 'Context' ] );
        
        this.Context = this._options.Context;
    },
    
    _setupActions_: function()
    {
        this.bindRemoveCheltuialaAction();
    },
    
    bindRemoveCheltuialaAction: function()
    {
        var self = this;
        
        this.bind( 'click', '.remove-cheltuiala-button', function()
        {
            self.removeCheltuiala();
        });
    },
    
    removeCheltuiala: function()
    {
        var self = this,
            cheltuialaId = this.getCurrentCheltuialaId();
    
        System.confirm( 'Sunteţi sigur că doriţi să eliminaţi această cheltuială?', {
            yes: function()
            {
                self.doRemove( cheltuialaId );
            }
        });
    },
    
    getCurrentCheltuialaId: function()
    {
        var id = this.Context.getCurrentCheltuialaId();
        
        return id;
    },
    
    doRemove: function( cheltuialaId )
    {
        System.request({
            action: 'remove-cheltuiala',
            params: {
                id: cheltuialaId
            },
            onSuccess: function()
            {
                DataResource.get( 'Cheltuieli' ).removeCheltuiala( cheltuialaId );
                
                System.info( 'Cheltuiala a fost eliminată.' );
            }
        });
    }
    
});

//------------------------------------------------------------------------------

var EditCheltuialaActionClass = _Components.Container.extend(
{
    _setup_: function()
    {
        this._setRequiredOptions( [ 'Context' ] );
        
        this.Context = this._options.Context;
    },
    
    _setupActions_: function()
    {
        this.bindEditCheltuialaAction();
    },
    
    bindEditCheltuialaAction: function()
    {
        var self = this;
        
        this.bind( 'click', '.edit-cheltuiala-button', function()
        {
            self.editCheltuiala();
        });
    },
    
    editCheltuiala: function()
    {
        var cheltuialaId = this.getCurrentCheltuialaId();
    
        _Cheltuieli.EditCheltuialaDialog.getInstance().open({
            cheltuialaId: cheltuialaId
        });
    },
    
    getCurrentCheltuialaId: function()
    {
        var id = this.Context.getCurrentCheltuialaId();
        
        return id;
    }
    
});
    
//==============================================================================

var DetailsPanesClass = _Components.Panes.extend(
{
    __interface: [ 'displayDetails' ],
    
    _setup_: function()
    {
        this._options.paneConstructorClass = __DetailsPaneClass;
        
        this._options.paneConstructors = {
            cheltuieli_gospodaresti: DetailsPaneCheltuieliGospodarestiClass,
            salarii:                DetailsPaneSalariiClass,
            energie_electrica:      DetailsPaneEnergieElectricaClass,
            intretinere_ascensor:   DetailsPaneIntretinereAscensorClass,
            autorizatie_ascensor:   DetailsPaneAutorizatieAscensorClass,
            lucrari_ascensor:       DetailsPaneLucrariAscensorClass,
            salubrizare:            DetailsPaneSalubrizareClass,
            gaze_naturale:          DetailsPaneGazeNaturaleClass,
            reparatie:              DetailsPaneReparatiiClass
        };
    },
    
    displayDetails: function( cheltuialaId )
    {
        var cheltuialaData = DataResource.get( 'Cheltuieli' ).getCheltuialaData( cheltuialaId );
                
        this.showPane( cheltuialaData.tip_id, { cheltuialaData: cheltuialaData } );
    }
    
});

//------------------------------------------------------------------------------

var __DetailsPaneClass = _Components.Container.extend(
{
    _setup_: function()
    {
        this.cheltuialaData = null;
        this.DetailsFrame = null;
    },
    
    _init_: function()
    {
        if( this.DetailsFrame === null )
        {
            System.exception( ExceptionCodes.UNDEFINED_PARAMETER, { parameter: 'DetailsFrame' } );
        }
    },
    
    _parameters_: function( params )
    {
        if( params.cheltuialaData !== undefined )
        {
            this.setcheltuialaData( params.cheltuialaData );
        }
    },
    
    setcheltuialaData: function( cheltuialaData )
    {
        this.cheltuialaData = cheltuialaData;
        
        this.DetailsFrame.setCheltuialaData( cheltuialaData );
    }
    
});

//==============================================================================

var DetailsPaneCheltuieliGospodarestiClass = __DetailsPaneClass.extend(
{
    _setupResources_: function()
    {
        this.DetailsFrame = new _Cheltuieli.CheltuieliGospodarestiDetails( this.find( '.tip-cheltuiala-details-frame' ) );
    }
});

//------------------------------------------------------------------------------

var DetailsPaneSalariiClass = __DetailsPaneClass.extend(
{
    _setupResources_: function()
    {
        this.DetailsFrame = new _Cheltuieli.SalariiDetails( this.find( '.tip-cheltuiala-details-frame' ) );
    }
});

//------------------------------------------------------------------------------

var DetailsPaneReparatiiClass = __DetailsPaneClass.extend(
{
    _setupResources_: function()
    {
        this.DetailsFrame = new _Cheltuieli.ReparatiiDetails( this.find( '.tip-cheltuiala-details-frame' ) );
    }
});

//------------------------------------------------------------------------------

var DetailsPaneEnergieElectricaClass = __DetailsPaneClass.extend(
{
    _setupResources_: function()
    {
        this.DetailsFrame = new _Cheltuieli.EnergieElectricaDetails( this.find( '.tip-cheltuiala-details-frame' ) );
    }
});

//------------------------------------------------------------------------------

var DetailsPaneIntretinereAscensorClass = __DetailsPaneClass.extend(
{
    _setupResources_: function()
    {
        this.DetailsFrame = new _Cheltuieli.IntretinereAscensorDetails( this.find( '.tip-cheltuiala-details-frame' ) );
    }
});

//------------------------------------------------------------------------------

var DetailsPaneAutorizatieAscensorClass = __DetailsPaneClass.extend(
{
    _setupResources_: function()
    {
        this.DetailsFrame = new _Cheltuieli.AutorizatieAscensorDetails( this.find( '.tip-cheltuiala-details-frame' ) );
    }
});

//------------------------------------------------------------------------------

var DetailsPaneLucrariAscensorClass = __DetailsPaneClass.extend(
{
    _setupResources_: function()
    {
        this.DetailsFrame = new _Cheltuieli.LucrariAscensorDetails( this.find( '.tip-cheltuiala-details-frame' ) );
    }
});

//------------------------------------------------------------------------------

var DetailsPaneSalubrizareClass = __DetailsPaneClass.extend(
{
    _setupResources_: function()
    {
        this.DetailsFrame = new _Cheltuieli.SalubrizareDetails( this.find( '.tip-cheltuiala-details-frame' ) );
    }
});

//------------------------------------------------------------------------------

var DetailsPaneGazeNaturaleClass = __DetailsPaneClass.extend(
{
    _setupResources_: function()
    {
        this.DetailsFrame = new _Cheltuieli.GazeNaturaleDetails( this.find( '.tip-cheltuiala-details-frame' ) );
    }
});

//------------------------------------------------------------------------------


//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

_Cheltuieli.CheltuieliCurente = CheltuieliCurenteClass;

})();