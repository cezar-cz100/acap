_DataResources.Cheltuieli = _Components.ApiResource.extend(
{
    _action: 'get-cheltuieli',
    
    _end_: function()
    {
        if( Object.isEmpty( this.getDataPointer().cheltuieli_curente ) )
        {
            this.getDataPointer().cheltuieli_curente = [];
        }
        
        this.sortCheltuieliCurente();
    },
    
    //--- public methods ---//
    
    hasCheltuieliCurente: function()
    {
        return !Object.isEmpty( this.getDataPointer().cheltuieli_curente );
    },
    
    getCheltuieliCurente: function()
    {
        return Object.clone( this.getDataPointer().cheltuieli_curente );
    },
    
    addCheltuiala: function( cheltuialaData )
    {
        var position = this._insertCheltuiala( cheltuialaData );
        
        this.notifyObservers( 'addCheltuiala', cheltuialaData, { position: position } );
    },
    
    editCheltuiala: function( cheltuialaData )
    {
        var cheltuialaId = cheltuialaData.id,
            position;
        
        // eliminare cheltuiala din setul de valori
        this._dropCheltuiala( cheltuialaId );
        
        // re-adaugare (pentru a se efectua si ordonarea)
        position = this._insertCheltuiala( cheltuialaData );
        
        this.notifyObservers( 'editCheltuiala', cheltuialaData, { position: position } );
    },
    
    removeCheltuiala: function( cheltuialaId )
    {
        this._dropCheltuiala( cheltuialaId );
        
        this.notifyObservers( 'removeCheltuiala', cheltuialaId );
    },
    
    getCheltuialaData: function( cheltuialaId )
    {
        var cheltuialaData = null;
        
        this.getDataPointer().cheltuieli_curente.each( function( currentItem )
        {
            var id = currentItem.id;
            
            if( id == cheltuialaId )
            {
                cheltuialaData = Object.clone( currentItem, true );
                
                return false;
            }
        });
        
        return cheltuialaData;
    },
    
    getCategorii: function()
    {
        return Object.clone( this.getDataPointer().categorii );
    },
    
    getTipuri: function()
    {
        return Object.clone( this.getDataPointer().tipuri );
    },
    
    //--- internal functions ---//
    
    sortCheltuieliCurente: function()
    {
        var self = this;
        
        this.getDataPointer().cheltuieli_curente = this.getDataPointer().cheltuieli_curente.sortBy( function( element )
        {
            return self._sortCheltuialaCriteria( element );
        });
    },
    
    _sortCheltuialaCriteria: function( cheltuialaData )
    {
        return cheltuialaData.parametri.data + ' ' + cheltuialaData.created_at;
    },
    
    _insertCheltuiala: function( cheltuialaData )
    {
        var self = this,
            cheltuialaSortCriteria = this._sortCheltuialaCriteria( cheltuialaData ),
            position = 0;
        
        this.getDataPointer().cheltuieli_curente.each( function( currentItem )
        {
            var currentItemCriteria = self._sortCheltuialaCriteria( currentItem );
            
            if( cheltuialaSortCriteria.naturalCompare( currentItemCriteria ) < 0 )
            {
                return false;
            }
            
            position++;
        });
        
        this.getDataPointer().cheltuieli_curente.insert( cheltuialaData, position );
        
        return position;
    },
    
    _dropCheltuiala: function( cheltuialaId )
    {
        this.getDataPointer().cheltuieli_curente.remove( function( currentItem )
        {
            return currentItem.id == cheltuialaId;
        });
    }
    
});

