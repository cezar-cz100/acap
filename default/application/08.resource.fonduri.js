_DataResources.Fonduri = _Components.ApiResource.extend(
{
    REPARTIZARE_MANDATORY:  2,
    REPARTIZARE_OPTIONAL:   1,
    REPARTIZARE_NONE:       0,
    
    TIP_INTRETINERE:        'intretinere',
    TIP_REPARATII:          'reparatii',
    TIP_EXTRA:              'extra',
    TIP_PENALIZARI:         'penalizari',
    
    __interface: [ 'getFonduri', 'getFond', 'getDenumireFond',
                   'isRepartizareMandatory', 'isRepartizareOptional', 'isRepartizareNone',
                   'isIntretinere' ],
    
    _action: 'get-fonduri',
    
    _end_: function()
    {
        if( Object.isEmpty( this._data.fonduri ) )
        {
            System.exception( ExceptionCodes.HALT, { reason: 'Nu este definit niciun fond.' } );
        }
        
        this._data.fonduri      = this.storeById( this._data.fonduri );
        this._data.tipuri_fond  = this.storeById( this._data.tipuri_fond );
    },
    
    getFondPointer: function( fondId )
    {
        return this._data.fonduri[ fondId ];
    },
    
    getFonduriPointer: function()
    {
        return this.getDataPointer().fonduri;
    },
    
    getTipuriFondPointer: function()
    {
        return this.getDataPointer().tipuri_fond;
    },
    
    getFonduri: function()
    {
        return Object.clone( this.getFonduriPointer() );
    },
    
    getFond: function( fondId )
    {
        var fond = Object.clone( this.getFondPointer( fondId ) );
        
        return fond;
    },
    
    getDenumireFond: function( fondId )
    {
        var denumire = this.getFondPointer( fondId ).denumire;
        
        return denumire;
    },
    
    isRepartizareMandatory: function( fondId )
    {
        var condition = ( this.getFondPointer( fondId ).repartizare == this.REPARTIZARE_MANDATORY );
    
        return condition;
    },
    
    isRepartizareOptional: function( fondId )
    {
        var condition = ( this.getFondPointer( fondId ).repartizare == this.REPARTIZARE_OPTIONAL );
    
        return condition;
    },
    
    isRepartizareNone: function( fondId )
    {
        var condition = ( this.getFondPointer( fondId ).repartizare == this.REPARTIZARE_NONE );
    
        return condition;
    },
    
    isIntretinere: function( fondId )
    {
        var condition = ( this.getTipuriFondPointer()[ this.getFondPointer( fondId ).tip_id ].tip == this.TIP_INTRETINERE );
    
        return condition;
    }
    
});
