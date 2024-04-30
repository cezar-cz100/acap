(function(){

var ScariItemsSectionClass = _Components.Container.extend(
{
    __abstract: [ 'getItemsCount' ],
    
    _setup_: function()
    {
        this.ItemsData = null;
        this.text = {};
        this.selection = null;
    },
    
    _setupResources_: function()
    {
        if( !_Components.Class.isExtendedFrom( this.ListRendererClass, _Configurare.ScariSelectionList ) )
        {
            System.exception( ExceptionCodes.INVALID_CLASS, { className: 'ListRendererClass' } );
        }
        
        this.ListRenderer = new this.ListRendererClass( this );
    },
    
    _setupElements_: function()
    {
        this.$counterText       = this.find( '.counter-text' );
        this.$buttonsContainer  = this.find( '.save-button-wrapper' );
        this.$restoreButton     = this.find( '.restore-button' );
    },
    
    _setupActions_: function()
    {
        this.setupResourceEvents();
        this.bindSaveButtonAction();
        this.bindRestoreButtonAction();
        this.bindSelectScaraAction();
    },
    
    _init_: function()
    {
        this.setupCountText();
        this.selection = this.ListRenderer.getSelection();
        this.checkSelectionElementsStatus();
    },
    
    setupCountText: function()
    {
        var count = this.getItemsCount(),
            text;
    
        if( count )
        {
            text = this.text.listMessage.assign( { count: String.pluralize( count, this.text.countSingular, this.text.countPlural ) } );
            this.$counterText.removeClass( 'alert-text' );
        }
        else
        {
            text = this.text.emptyMessage;
            this.$counterText.addClass( 'alert-text' );
        }
        
        this.$counterText.text( text );
    },
    
    setupResourceEvents: function()
    {
        var self = this,
            observer = {};
    
        observer[ this.dataObserverEvent ] = function()
        {
            self.setupCountText();
        };
        
        this.ItemsData.registerObserver( observer );
    },
    
    bindSaveButtonAction: function()
    {
        var self = this;
        
        this.find( '.save-button' ).on( 'click', function()
        {
            self.saveList();
        });
    },
    
    bindRestoreButtonAction: function()
    {
        var self = this;
        
        this.$restoreButton.on( 'click', function()
        {
            self.restoreSelection();
        });
    },
    
    bindSelectScaraAction: function()
    {
        var self = this;
        
        this.bind( 'change', '.list-item', function()
        {
            self.checkSelectionElementsStatus();
        });
    },
    
    saveList: function()
    {
        var self = this,    
            newSelection = this.ListRenderer.getSelection();
        
        if( this.isSelectionChanged( newSelection ) )
        {
            this.ItemsData[ this.dataObserverEvent ]( newSelection, {
                onSuccess: function()
                {
                    self.selection = newSelection;
                    self.checkSelectionElementsStatus();
                    self.ListRenderer.highlightSelectedItems();
                }
            });
        }
    },
    
    isSelectionChanged: function( newSelection )
    {
        var changed,
            currentSelection = this.selection;
    
        if( newSelection === undefined )
        {
            newSelection = this.ListRenderer.getSelection();
        }
        
        changed = ( 
                ( !Object.isEmpty( newSelection ) || !Object.isEmpty( currentSelection ) ) 
                && !Object.equal( newSelection, currentSelection ) 
        );
        
        return changed;
    },
    
    restoreSelection: function()
    {
        this.ListRenderer.restoreSelection();
        this.checkSelectionElementsStatus();
    },
    
    checkSelectionElementsStatus: function()
    {
        if( this.isSelectionChanged() )
        {
            this.$buttonsContainer.show();
        }
        else
        {
            this.$buttonsContainer.hide();
        }
    }
    
});

var ScariSelectionListClass = _Components.Container.extend(
{
    __interface: [ 'getSelection', 'highlightSelectedItems', 'restoreSelection' ],
    __abstract: [ 'getItemsData' ],
    
    _setup_: function()
    {
        this.StructuraData  = DataResource.get( 'Structura' );
    },
    
    _setupElements_: function()
    {
        this.$list = this.find( '.list-content' );
    },
    
    _setupActions_: function()
    {
        this.setupResourceEvents();
    },
    
    _init_: function()
    {
        this.generateContent();
    },
    
    generateContent: function()
    {
        var self = this,
            scariIds = this.StructuraData.getScariIds();
        
        this.$list.empty();
        
        Object.each( scariIds, function( i, scaraId )
        {
            self.addItem( scaraId );
        });
        
        this.highlightSelectedItems();
    },
    
    addItem: function( scaraId )
    {
        var $template = this._getTemplate( 'list-item' ),
            denumireScara = this.StructuraData.getDenumireScara( scaraId );
    
        $template.find( '.denumire-scara' ).text( denumireScara );
        $template.data( 'scara-id', scaraId );
        
        $template.appendTo( this.$list );        
    },
    
    itemExistsForScara: function( scaraId )
    {
        var items = this.getItemsData(),
            exists = false;
        
        Object.each( items, function( i, item )
        {
            if( item.scara_id == scaraId )
            {
                exists = true;
                
                return false;
            }
        });
                
        return exists;
    },
    
    setupResourceEvents: function()
    {
        var self = this;
        
        this.StructuraData.registerObserver(
        {
            'addBloc editBloc removeBloc addScara editScara removeScara': function()
            {
                self.generateContent();
            }
        });
    },
    
    getItems: function()
    {
        return this.$list.find( '>.list-item' );
    },
    
    highlightSelectedItems: function()
    {
        var self = this;
        
        this.getItems().each( function()
        {
            var $item = $(this),
                scaraId = $item.data( 'scara-id' ),
                itemExists = self.itemExistsForScara( scaraId ),
                $checkbox = $item.find( ':checkbox' );

            if( itemExists )
            {
                $item.addClass( 'selected' );
            }
            else
            {
                $item.removeClass( 'selected' );
            }
            
            $checkbox.prop( 'checked', itemExists );
        });
    },
    
    getSelection: function()
    {
        var selection = [];
        
        this.getItems().each( function()
        {
            var $item = $(this),
                $checkbox = $item.find( ':checkbox' ),
                scaraId;
                
            if( $checkbox.prop( 'checked' ) )
            {
                scaraId = $item.data( 'scara-id' );
                
                var itemData = {
                    scara_id: scaraId
                };
                
                selection.push( itemData );
            }
        });
        
        return selection;
    },

    restoreSelection: function()
    {
        this.highlightSelectedItems();
    }

});

//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

_Configurare.ScariSelectionList = ScariSelectionListClass;
_Configurare.ScariItemsSection = ScariItemsSectionClass;

})();