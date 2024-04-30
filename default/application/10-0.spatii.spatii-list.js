(function(){

var SpatiiListClass = _Components.Container.extend(
{
    __interface: [ 'getListHeader' ], //...
    
    _setup_: function()
    {
        if( Object.isEmpty( this.getOption( 'scaraId' ) ) )
        {
            System.exception( ExceptionCodes.OPTION_MISSING, { option: 'scaraId' } );
        }
        
        this.StructuraData = DataResource.get( 'Structura' );
        
        this.scaraId = this.getOption( 'scaraId' );
        this.blocId = this.StructuraData.getScaraInfo( this.scaraId ).bloc_id;
    },
    
    _setupElements_: function()
    {
        this.$listHeader    = this.find( '>.list-header' );
        this.$listContainer = this.find( '>.list-container' );
    },
    
    _setupActions_: function()
    {
        this.bindStructuraDataEvents();
    },
    
    _init_: function()
    {
        this.generateContent();
    },

    _reset_: function()
    {
        // this._showAllRows();
    },
    
    bindStructuraDataEvents: function()
    {
        var self = this;
        
        this.StructuraData.registerObserver({
            addSpatiu: function( spatiuData, options )
            {
                if( spatiuData.scara_id == self.scaraId )
                {
                    self.addSpatiuRow( spatiuData, options );
                }
            },
            removeSpatiu: function( spatiuData )
            {
                if( spatiuData.scara_id == self.scaraId )
                {
                    self.removeSpatiuRow( spatiuData.id );
                }
            },
            editSpatiu: function( spatiuData )
            {
                if( spatiuData.scara_id == self.scaraId )
                {
                    self.editSpatiuRow( spatiuData );
                }
            }
        });
    },
    
    getScaraId: function()
    {
        return this.scaraId;
    },
    
    getBlocId: function()
    {
        return this.blocId;
    },
    
    getScaraData: function()
    {
        return this.StructuraData.getScaraInfo( this.getScaraId() );
    },
    
    getSpatiiCount: function()
    {
        return this.StructuraData.getSpatiiCount( this.getScaraId() );
    },
    
    hasSpatii: function()
    {
        return Object.toBoolean( this.getTotalSpatii() );
    },
    
    showContents: function()
    {
        this.$listHeader.show();
        this.$listContainer.show();
    },
        
    hideContents: function()
    {
        this.$listHeader.hide();
        this.$listContainer.hide();
    },

    getListHeader: function()
    {
        return this.$listHeader;
    },
        
    generateContent: function()
    {
        var self = this, spatiiData;
                
        spatiiData = this.getSpatiiData();
        
        spatiiData.each( function( spatiuData ){
            self.addSpatiuRow( spatiuData );
        });
        
        if( !spatiiData.length )
        {
            this.hideContents();
        }
    },
    
    getSpatiiData: function()
    {
        var self = this,
            spatiiData = [];
        
        if( this.getOption( 'spatii' ) )
        {
            var spatiiIds = this.getOption( 'spatii' );
            
            spatiiData = spatiiIds.map( function( spatiuId )
            {
                return self.StructuraData.getSpatiuInfo( spatiuId );
            });
        }
        else if( this.getOption( 'scaraId' ) )
        {
            var scaraId = this.getOption( 'scaraId' );
                    
            spatiiData = this.StructuraData.getSpatii( scaraId );
        }
        
        return spatiiData;
    },
    
    addSpatiuRow: function( spatiuData, options )
    {
        var $spatiuRow, $etajSpatiiContainer, position, $spatiuRowTarget;
        
        options = Object.makeObject( options );
        
        position = options.position;
        
        $spatiuRow              = this._getTemplate( 'spatiu-row' );
        $etajSpatiiContainer    = this.getEtajSpatiiContainer( spatiuData.etaj, options );
        
        this.populateSpatiuRow( $spatiuRow, spatiuData );
        
        if( !$etajSpatiiContainer.children( '.spatiu-row' ).length )
        {
            $spatiuRow.appendTo( $etajSpatiiContainer );
        }
        else
        {
            $spatiuRowTarget = this.getSpatiuRowByIndex( options.position );
            
            if( $spatiuRowTarget.length && this.getEtajSpatiiContainerBySpatiuRow( $spatiuRowTarget ).is( $etajSpatiiContainer ) )
            {
                $spatiuRow.insertBefore( $spatiuRowTarget );
            }
            else
            {
                $spatiuRow.appendTo( $etajSpatiiContainer );
            }
        }
        
        this.showContents();
    },
    
    /**
     * If the container doesn't exist, it will be created.
     */
    getEtajSpatiiContainer: function( etaj, options )
    {
        var $etajContainer, $etajSpatiiContainer;
                
        $etajContainer          = this.getEtajContainer( etaj, options ),
        $etajSpatiiContainer    = $etajContainer.find( '>.etaj-spatii-container' );
        
        return $etajSpatiiContainer;
    },
    
    /**
     * If the container doesn't exist, it will be created.
     */
    getEtajContainer: function( etaj, options )
    {
        var $etajContainer, spatiuPosition, $spatiuRow, $spatiuRowEtajContainer, inserted;
        
        spatiuPosition = options.position;
        
        $etajContainer = this.getEtajContainers().filter(function(){
            return $(this).data( 'etaj' ) == etaj;
        });
        
        if( !$etajContainer.length )
        {
            $etajContainer = this._getTemplate( 'etaj-container' );
            this.populateEtajContainer( $etajContainer, etaj );
            
            inserted = false;
            
            if( spatiuPosition !== undefined )
            {
                $spatiuRow = this.getSpatiuRowByIndex( spatiuPosition );
                
                if( $spatiuRow.length )
                {
                    $spatiuRowEtajContainer = this.getEtajContainerOfElement( $spatiuRow );
                    
                    $etajContainer.insertBefore( $spatiuRowEtajContainer );
                    
                    inserted = true;
                }
            }
            
            if( !inserted )
            {
                $etajContainer.appendTo( this.$listContainer );
            }
        }
        
        return $etajContainer;
    },
    
    populateSpatiuRow: function( $spatiuRow, spatiuData )
    {
        $spatiuRow.data( 'id', spatiuData.id );
        $spatiuRow.data( 'data', spatiuData );
        
        $spatiuRow.find( '>.numar-cell' ).text( spatiuData.numar );
        $spatiuRow.find( '>.proprietar-cell' ).text( spatiuData.proprietar );

        $spatiuRow.find( '>.persoane-cell' ).text( spatiuData.nr_pers || '-' );
        $spatiuRow.find( '>.suprafata-cell' ).text( spatiuData.suprafata );
        
        var $sumaCell = $spatiuRow.find( '>.suma-cell' );
        
        if( $sumaCell.size() )
        {
            var sume = this.getOption( 'sume' );
            
            if( !Object.isEmpty( sume ) )
            {
                $sumaCell.text( sume[ spatiuData.id ] );
            }
        }
    },
    
    populateEtajContainer: function( $etajContainer, etaj )
    {
        $etajContainer.data( 'etaj', etaj );
        
        $etajContainer.find( '.etaj-cell' ).text( etaj );
    },
    
    getSpatiuRowByIndex: function( index )
    {
        var $spatiuRow;
        
        $spatiuRow = this.find( '.spatiu-row' ).eq( index );
        
        return $spatiuRow;
    },
    
    getSpatiuRowParent: function( $element )
    {
        var $spatiuRow = $element.closest( '.spatiu-row' );
        
        return $spatiuRow;
    },
    
    getEtajContainers: function()
    {
        return this.$listContainer.find( '>.etaj-container' );
    },
    
    getEtajContainerOfElement: function( $element )
    {
        var $etajContainer;
        
        $etajContainer = $element.closest( '.etaj-container' );
        
        return $etajContainer;
    },
    
    getEtajSpatiiContainerBySpatiuRow: function( $spatiuRow )
    {
        var $etajSpatiiContainer;
        
        $etajSpatiiContainer = $spatiuRow.closest( '.etaj-spatii-container' );
        
        return $etajSpatiiContainer;
    },
    
    getSpatiuRow: function( spatiuId )
    {
        var $spatiuRow;
        
        $spatiuRow = this.getSpatiuRows().filter( function(){
            return $(this).data( 'id' ) == spatiuId;
        });
        
        return $spatiuRow;
    },
    
    getSpatiuId: function( $row )
    {
        return $row.data( 'id' );
    },
    
    getSpatiuRows: function( filter )
    {
        var $rows = this.find( '.spatiu-row' );
        
        if( filter !== undefined )
        {
            $rows = $rows.filter( filter );
        }
        
        return $rows;
    },
    
    getSpatiuRowsInsideContainer: function( $container )
    {
        return $container.find( '.spatiu-row' );
    },
    
    removeSpatiuRow: function( spatiuId )
    {
        var $spatiuRow;
        
        $spatiuRow = this.getSpatiuRow( spatiuId );
        
        // verific daca etajul mai contine alte spatii
        if( !$spatiuRow.siblings( '.spatiu-row' ).length )
        {
            this.getEtajContainerOfElement( $spatiuRow ).remove();
        }

        $spatiuRow.remove();
                
    },
    
    editSpatiuRow: function( spatiuData )
    {
        var $spatiuRow;
        
        $spatiuRow = this.getSpatiuRow( spatiuData.id );
        
        this.populateSpatiuRow( $spatiuRow, spatiuData );
    },
    
    hideRow: function( $row )
    {
        $row.hide();
        $row.data( 'hidden', true );
        
        this.checkEtajContainerVisibility( $row );
    },
    
    showRow: function( $row )
    {
        $row.show();
        $row.removeData( 'hidden' );
        
        this.checkEtajContainerVisibility( $row );
    },
    
    isRowVisible: function( $row )
    {
        return !$row.data( 'hidden' );
    },
    
    filterVisibleRows: function( $rows )
    {
        var self = this,
            $visibleRows;
                
        $visibleRows = $rows.filter( function()
        {
            return self.isRowVisible( $(this) );
        });
        
        return $visibleRows;
    },
    
    getAllVisibleSpatiuRows: function()
    {
        var $rows = this.filterVisibleRows( this.getSpatiuRows() );
        
        return $rows;
    },
    
    getTotalSpatii: function()
    {
        return this.getAllVisibleSpatiuRows().size();
    },
    
    showAllRows: function()
    {
        this.showRow( this.getSpatiuRows() );
        this.getEtajContainers().show();
    },
    
    showSpatii: function( spatii )
    {
        var self = this;
        
        this.showAllRows();
        
        if( spatii === true || spatii === '*' )
        {
            
        }
        else if( Object.isArray( spatii ) )
        {
            this.getSpatiuRows().each( function()
            {
                var $row = $(this),
                    spatiuId = $row.data( 'id' );

                if( !( spatii.indexOf( spatiuId ) >= 0 ) )
                {
                    self.hideRow( $row );
                }
            });
        }
    },
    
    checkEtajContainerVisibility: function( $element )
    {
        var $etajContainer = this.getEtajContainerOfElement( $element ),
            $visibleRows = this.filterVisibleRows( this.getSpatiuRowsInsideContainer( $etajContainer ) );

        if( $visibleRows.length )
        {
            $etajContainer.show();
        }
        else
        {
            $etajContainer.hide();
        }
    }
    
});

//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

_Spatii.SpatiiList = SpatiiListClass;

})();

