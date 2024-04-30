/* global DataResource */

(function(){
    
_DataResources.Configuration = _Components.ApiResource.extend(
{
    _action: 'get-config',
    
    _init_: function()
    {
        this.ConfigInstances = {};
    },
    
    _end_: function()
    {
        //this._decodeFirstMonth();
    },
    
    getConfiguration: function( config )
    {
        var C,
            configClass = ConfigClasses[ config.camelize() ];
        
        if( _Components.Class.isExtendedFrom( configClass, __ConfigClass ) )
        {
            if( !this.ConfigInstances[ config ] )
            {
                var configData = this.getDataPointer()[ config ] || {};
                
                this.ConfigInstances[ config ] = new configClass( { data: configData } );
            }
            
            C = this.ConfigInstances[ config ];
        }
        else
        {
            C = Object.clone( this.getDataPointer()[ config ], true );
        }
        
        return C;
    },
    
    isInitialized: function()
    {
        //return Object.toBoolean( this._data.initialized );
        return true;
    }
    
//    getInitializationStep: function()
//    {
//        return this._data.initialization_step;
//    },
//    
//    getFreezedPage: function()
//    {
//        return this._data.freezed_page || null;
//    },
//    
//    getFirstMonth: function()
//    {
//        return this._data.first_month || null;
//    },
//    
//    setFirstMonth: function( monthYear )
//    {
//        this._data.first_month = monthYear;
//        
//        this.notifyObservers( 'firstMonth', monthYear );
//    },
//    
//    //--- internal functions ---//
//    
//    _decodeFirstMonth: function()
//    {
//        var firstMonth = this._data.first_month;
//        
//        if( firstMonth === undefined ) return;
//        
//        var year, month;
//        
//        year = firstMonth.first( 4 ) - 0;
//        month = firstMonth.last( 2 ) - 0;
//        
//        this._data.first_month = {
//            year: year,
//            month: month
//        };
//    }
    
});

//==============================================================================

var ConfigClasses = {};

var __ConfigClass = _Components.StaticResource.extend(
{
    getParameterDataPointer: function( parameter )
    {
        var pointer = this.getDataPointer();
        
        if( pointer[ parameter ] === undefined )
        {
            System.exception( ExceptionCodes.UNEXPECTED_VALUE, { argument: 'parameter', value: parameter } );
        }
        
        return pointer[ parameter ];
    },
    
    storeParameterDataById: function( parameter )
    {
        this._data[ parameter ] = this._data[ parameter ] || [];
        
        var thisData = Object.clone( this._data[ parameter ] ),
            newData = {};
        
        Object.each( thisData, function( index, value )
        {
            newData[ value.id ] = value;
        });
        
        this._data[ parameter ] = newData;
    },
    
    /**
     * @returns Array
     */
    getParameterDataAsList: function( parameter )
    {
        return Object.clone( Object.values( this.getParameterDataPointer( parameter ) ) );
    },
    
    getParameterItemPointer: function( parameter, id )
    {
        var dataPointer = this.getParameterDataPointer( parameter );
        
        if( dataPointer[ id ] === undefined )
        {
            System.exception( ExceptionCodes.UNEXPECTED_VALUE, { argument: 'parameterId', value: id } );
        }
        
        return dataPointer[ id ];
    },
    
    getParameterItem: function( parameter, id )
    {
        return Object.clone( this.getParameterItemPointer( parameter, id ) );
    },
    
    addParameterItem: function( parameter, data )
    {
        if( this._data[ parameter ] === undefined )
        {
            this._data[ parameter ] = {};
        }
        
        this._data[ parameter ][ data.id ] = data;
    },
    
    removeParameterItem: function( parameter, id )
    {
        if( Object.isObject( this._data[ parameter ] ) )
        {
            delete this._data[ parameter ][ id ];
        }
    },
    
    updateParameterConfig: function( parameter, configuration )
    {
        this._data[ parameter ] = Object.clone( configuration );
        
        this.storeParameterDataById( parameter );
    }
    
});

//==============================================================================

ConfigClasses.EnergieElectrica = __ConfigClass.extend(
{
    __interface: [ 'getContoare', 'getContor', 'getContoareCount', 'addContor',
                   'getContorScutiriText', 'generateContorScutireText' ],
    
    _init_: function()
    {
        this.storeParameterDataById( 'contor' );
    },
    
    getContoare: function()
    {
        return this.getParameterDataAsList( 'contor' );
    },
    
    getContor: function( contorId )
    {
        var contor = this.getParameterItem( 'contor', contorId );
        
        return contor;
    },
    
    getContoareCount: function()
    {
        return Object.size( this.getParameterDataPointer( 'contor' ) );
    },
    
    getContorScutiriText: function( contorId )
    {
        var self = this,
            contor = this.getParameterItemPointer( 'contor', contorId ),
            text = [];
        
        if( !Object.isEmpty( contor.scutiri ) )
        {
            Object.each( contor.scutiri, function( i, scutire )
            {
                var scutireText = self.generateContorScutireText( scutire );
                
                text.push( scutireText );
            });
        }
        
        return text;
    },
    
    generateContorScutireText: function( instalatie )
    {
        var persoaneCount = DataResource.get( 'Structura' ).getPersoaneCount( instalatie.spatii ),
            persoaneText = String.pluralize( persoaneCount, 'persoană', 'persoane' ),
            spatiiCount = Object.size( instalatie.spatii ),
            spatiiText = spatiiCount == 1 ? 'dintr-un apartament' : ( 'din ' + String.pluralize( spatiiCount, 'apartament', 'apartamente' ) ),
            predicatText = persoaneCount == 1 ? 'este scutită' : 'sunt scutite',
            denumireText = instalatie.denumire,
            procentText = instalatie.procent,
            text;
        
        text = persoaneText + ' ' + spatiiText + ' ' + predicatText +
               ' de la plata consumului pentru "' + denumireText + '", ' +
               'estimat la ' + procentText + '% din consumul total.';
        
        return text;
    },
    
    addContor: function( contorValues, options )
    {
        var self = this,
            requestParams = {
                categorie:  'energie_electrica',
                parametru:  'contor',
                valoare:    contorValues
            };
        
        options = Object.makeObject( options );
        
        System.request({
            action:     'add-config',
            params:     requestParams,
            onSuccess:  function( contorData )
            {
                System.info( 'Contorul a fost înregistrat.' );
                
                self.addParameterItem( 'contor', contorData );
                self.notifyObservers( 'addContor', contorData );
                
                if( Object.isFunction( options.onSuccess ) )
                {
                    options.onSuccess.call( self, contorData );
                }
            }
        });        
    },
    
    editContor: function( contorValues, options )
    {
        var self = this,
            requestParams = {
                config_id:  contorValues.id,
                valoare:    contorValues
            };
        
        options = Object.makeObject( options );
        
        System.request({
            action:     'edit-config',
            params:     requestParams,
            onSuccess:  function( contorData )
            {
                System.info( 'Datele contorului au fost modificate.' );
                
                self.addParameterItem( 'contor', contorData );
                self.notifyObservers( 'editContor', contorData );
                
                Object.isFunction( options.onSuccess ) &&
                    options.onSuccess.call( self, contorData );
            }
        });        
    },
    
    removeContor: function( contorId, options )
    {
        var self = this,
            contorData = this.getParameterItem( 'contor', contorId ),
            requestParams = {
                config_id:  contorId
            };
        
        options = Object.makeObject( options );
        
        System.request({
            action:     'remove-config',
            params:     requestParams,
            onSuccess:  function()
            {
                System.info( 'Contorul a fost eliminat.' );
                
                self.removeParameterItem( 'contor', contorId );
                self.notifyObservers( 'removeContor', contorId, contorData );
                
                Object.isFunction( options.onSuccess ) &&
                    options.onSuccess.call( self, contorId, contorData );
            }
        });        
    }
    
});

//==============================================================================

ConfigClasses.Ascensoare = __ConfigClass.extend(
{
    __interface: [ 'getAscensoare', 'getAscensor', 'getDenumireAscensor', 'getAscensoareCount',
                   'updateAscensoare' ],
    
    _init_: function()
    {
        this.storeParameterDataById( 'ascensor' );
        
        // @todo Ordonarea ascensoarelor se face dupa scara_id si sufix
    },
    
    /**
     * @returns Array
     */
    getAscensoare: function()
    {
        return this.getParameterDataAsList( 'ascensor' );
    },
    
    getAscensoareCount: function()
    {
        var count = Object.size( this.getParameterDataPointer( 'ascensor' ) );
                
        return count;
    },
    
    getAscensor: function( ascensorId )
    {
        var ascensorData = this.getParameterItem( 'ascensor', ascensorId );
        
        return ascensorData;
    },
    
    getDenumireAscensor: function( ascensorId )
    {
        var StructuraData = DataResource.get( 'Structura' ),
            ascensorData = this.getAscensor( ascensorId ),
            denumire = '',
            blocText = '',
            scaraText = '',
            ascensorText = '',
            blocuriCount = StructuraData.getBlocuriCount(),
            scaraId = ascensorData.scara,
            scaraData = StructuraData.getScaraInfo( scaraId ),
            blocId = scaraData.bloc_id,
            blocData = StructuraData.getBlocInfo( blocId ),
            denumireBloc = blocData.denumire,
            denumireScara = scaraData.denumire,
            scariCount = StructuraData.getScariCount( blocId );
        
        if( blocuriCount >= 2 )
        {
            blocText = 'Bl.' + denumireBloc + ', ';
        }
        
        if( scariCount >= 2 || blocuriCount >= 2 )
        {
            scaraText = 'Sc.' + denumireScara;
        }
        
        denumire = [ blocText, scaraText, ascensorText ].join( '' );
        
        return denumire;
    },
    
    updateAscensoare: function( ascensoareValues, options )
    {
        var self = this,
            requestParams = {
                categorie:  'ascensoare',
                parametru:  'ascensor',
                valori:     ascensoareValues
            };
        
        options = Object.makeObject( options );
        
        System.request({
            action:     'update-config',
            params:     requestParams,
            onSuccess:  function( ascensoareData )
            {
                System.info( 'Ascensoarele au fost înregistrate.' );
                
                self.updateParameterConfig( 'ascensor', ascensoareData );
                self.notifyObservers( 'updateAscensoare', ascensoareData );
                
                if( Object.isFunction( options.onSuccess ) )
                {
                    options.onSuccess.call( self, ascensoareData );
                }
            }
        });        
    },
    
    //-- internal methods --//
    
    getAscensoareScaraCount: function( scaraId )
    {
        var count = 0;
        
        Object.each( this.getParameterDataPointer( 'ascensor' ), function( id, ascensorData )
        {
            if( ascensorData.scara_id == scaraId )
            {
                count++;
            }
        });
        
        return count;
    }
    
});

//==============================================================================

ConfigClasses.GazeNaturale = __ConfigClass.extend(
{
    __interface: [ 'getBransament', 'getBransamente', 'getDenumireBransament', 'getBransamenteCount',
                   'updateBransamente' ],
    
    _init_: function()
    {
        this.storeParameterDataById( 'bransament' );
    },
    
    /**
     * @returns Array
     */
    getBransamente: function()
    {
        return this.getParameterDataAsList( 'bransament' );
    },
    
    getBransamenteCount: function()
    {
        var count = Object.size( this.getParameterDataPointer( 'bransament' ) );
                
        return count;
    },
    
    getBransament: function( id )
    {
        var bransamentData = this.getParameterItem( 'bransament', id );
        
        return bransamentData;
    },
    
    /**
     * options:
     * - denumireBloc: [ 'articulat' ]
     */
    getDenumireBransament: function( id, options )
    {
        options = Object.makeObject( options );
        
        var StructuraData = DataResource.get( 'Structura' ),
            bransament = this.getParameterItemPointer( 'bransament', id ),
            denumireBransament = '',
            scaraId = bransament.scara_id,
            scaraInfo = StructuraData.getScaraInfo( scaraId ),
            blocId = scaraInfo.bloc_id,
            denumireBloc = StructuraData.getBlocInfo( blocId ).denumire,
            denumireScara = scaraInfo.denumire,
            denumireBlocText = 'Bloc' + ( options.denumireBloc == 'articulat' ? 'ul' : '' ) + ' ' + denumireBloc,
            scaraText = denumireBlocText + ', Scara ' + denumireScara;
        
        denumireBransament = scaraText;
        
        return denumireBransament;
    },
    
    updateBransamente: function( bransamenteValues, options )
    {
        var self = this,
            requestParams = {
                categorie:  'gaze_naturale',
                parametru:  'bransament',
                valori:     bransamenteValues
            };
        
        options = Object.makeObject( options );
        
        System.request({
            action:     'update-config',
            params:     requestParams,
            onSuccess:  function( bransamenteData )
            {
                System.info( 'Branşamentele au fost înregistrate.' );
                
                self.updateParameterConfig( 'bransament', bransamenteData );
                self.notifyObservers( 'updateBransamente', bransamenteData );
                
                if( Object.isFunction( options.onSuccess ) )
                {
                    options.onSuccess.call( self, bransamenteData );
                }
            }
        });        
    }
    
});

})();