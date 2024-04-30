_DataResources.Structura = _Components.ApiResource.extend(
{
    __interface: [ 'getSpatiiCount', 'getSpatiiScaraCount' ], //...
    
    _action: 'get-structura',
    
    _init_: function()
    {
        this.parametriSpatiuFlags = {};
    },
    
    _end_: function()
    {
        this._sortStructuraByDenumire();
        
//        this._initParametriSpatiuFlags();
    },
    
    getBlocuri: function()
    {
        var blocuri = Object.clone( this._getBlocuriPointer(), true );
        
        return blocuri;
    },
    
    hasSpatii: function()
    {
        var has = false;
        
        this._getBlocuriPointer().each( function( blocData ){
            blocData.scari.each( function( scaraData ){
                if( scaraData.spatii.length )
                {
                    has = true;

                    return false;
                }
            });
            
            if( has ) return false;
        });
        
        return has;
    },
    
    getBlocInfo: function( blocId )
    {
        var info = {}, pointer;
        
        pointer = this._getBlocPointer( blocId );
        if( pointer )
        {
            info = Object.clone( pointer, true );
            delete info.scari;
        }
        
        return info;
    },
    
    getScaraInfo: function( scaraId )
    {
        var info = {}, pointer;
        
        pointer = this._getScaraPointer( scaraId );
        if( pointer )
        {
            info = Object.clone( pointer, true );
            info.denumire_bloc = this._getBlocPointer( info.bloc_id ).denumire;

            delete info.spatii;
        }
       
        return info;
    },
    
    getSpatiuInfo: function( spatiuId )
    {
        var info = {}, pointer;
        
        pointer = this._getSpatiuPointer( spatiuId );
        if( pointer )
        {
            info = Object.clone( pointer, true );
        }
       
        return info;
    },
    
    getSpatiu: function( spatiuId )
    {
        var spatiu = Object.clone( this._getSpatiuPointer( spatiuId ) );
        
        return spatiu;
    },
    
    addBloc: function( blocData )
    {
        var blocuri, position, denumire;
        
        position = 0;
        blocuri = this._getBlocuriPointer();
        blocData.scari = [];
        denumire = blocData.denumire;
        
        // determine on which position the element will be added
        blocuri.each( function( bloc )
        {
            var denumireBloc = bloc.denumire;
            
            if( denumire.naturalCompare( denumireBloc ) < 0 )
            {
                return false;
            }
            
            position++;
        });
        
        blocuri.insert( blocData, position );
        
        this.notifyObservers( 'addBloc', blocData, { position: position } );
    },
    
    removeBloc: function( blocData )
    {
        var blocuri = this._getBlocuriPointer();
        blocuri.remove( function( currentValue ){
            return currentValue.id == blocData.id;
        });
        
        this.notifyObservers( 'removeBloc', blocData );
        
        if( !this.hasSpatii() )
        {
            this.notifyObservers( 'hasNoSpatii' );
        }
        
        this._checkParametriSpatiu();
    },
    
    editBloc: function( blocData )
    {
        var blocPointer, blocuriPointer, currentPosition, newPosition, denumire, denumireOld, options;

        blocuriPointer = this._getBlocuriPointer();
        blocPointer = this._getBlocPointer( blocData.id );
        
        denumireOld = blocPointer.denumire.toLowerCase();
        denumire = blocData.denumire.toLowerCase();
        
        Object.extend( blocPointer, blocData );
        
        if( blocuriPointer.length == 1 || denumire.naturalCompare( denumireOld ) == 0 )
        {
            // do nothing
        }
        else
        {
            // determine current position
            currentPosition = blocuriPointer.indexOf( blocPointer );

            // remove element
            blocuriPointer.removeAt( currentPosition );

            // determine new position
            newPosition = 0;
            
            blocuriPointer.each( function( bloc )
            {
                var denumireBloc = bloc.denumire.toLowerCase();

                if( denumire.naturalCompare( denumireBloc ) < 0 )
                {
                    return false;
                }

                newPosition++;
            });
            
            blocuriPointer.insert( blocPointer, newPosition );
            
            options = { position: newPosition };
        }
        
        this.notifyObservers( 'editBloc', blocData, options );
    },
    
    addScara: function( scaraData )
    {
        var blocId, scari, position, denumire;
        
        position = 0;
        blocId = scaraData.bloc_id;
        scari = this._getScariPointer( blocId );
        blocId = scaraData.bloc_id;
        scaraData.spatii = [];
        denumire = scaraData.denumire.toLowerCase();
        
        // determine on which position the element will be added
        scari.each( function( scara )
        {
            var denumireScara = scara.denumire.toLowerCase();
            
            if( denumire.naturalCompare( denumireScara ) < 0 )
            {
                return false;
            }
            
            position++;
        });
        
        scari.insert( scaraData, position );
        
        this.notifyObservers( 'addScara', scaraData, { position: position } );
    },
    
    editScara: function( scaraData )
    {
        var scaraPointer, scariPointer, currentPosition, newPosition, denumire, denumireOld, options;
        
        scariPointer = this._getScariPointer( this._getScaraPointer( scaraData.id ).bloc_id );
        scaraPointer = this._getScaraPointer( scaraData.id );
        
        denumireOld = scaraPointer.denumire.toLowerCase();
        denumire = scaraData.denumire.toLowerCase();
        
        Object.extend( scaraPointer, scaraData );
        
        if( scariPointer.length == 1 || denumire.naturalCompare( denumireOld ) == 0 )
        {
            // do nothing
        }
        else
        {
            // determine current position
            currentPosition = scariPointer.indexOf( scaraPointer );

            // remove element
            scariPointer.removeAt( currentPosition );

            // determine new position
            newPosition = 0;
            
            scariPointer.each( function( scara )
            {
                var denumireScara = scara.denumire.toLowerCase();

                if( denumire.naturalCompare( denumireScara ) < 0 )
                {
                    return false;
                }

                newPosition++;
            });
            
            scariPointer.insert( scaraPointer, newPosition );
            
            options = { position: newPosition };
        }
        
        this.notifyObservers( 'editScara', scaraData, options );
    },
    
    removeScara: function( scaraData )
    {
        var blocId = this.getScaraInfo( scaraData.id ).bloc_id,
            scari = this._getScariPointer( blocId );
    
        scari.remove( function( currentValue ){
            return currentValue.id == scaraData.id;
        });
        
        scaraData.bloc_id = blocId;
        
        this.notifyObservers( 'removeScara', scaraData );
        
        if( !this.hasSpatii() )
        {
            this.notifyObservers( 'hasNoSpatii' );
        }
        
        this._checkParametriSpatiu();
    },
    
    addSpatiu: function( spatiuData )
    {
        var scaraId, hasSpatii, spatii, position, criteriu;
                
        position = 0;
        scaraId = spatiuData.scara_id,
        hasSpatii = this.hasSpatii();
        spatii = this._getSpatiiPointer( scaraId );
        criteriu = ( spatiuData.etaj_order + ' ' + spatiuData.numar ).toLowerCase();
        
        // determine on which position the element will be added
        spatii.each( function( spatiu )
        {
            var criteriuSpatiu = ( spatiu.etaj_order + ' ' + spatiu.numar ).toLowerCase();
            
            if( criteriu.naturalCompare( criteriuSpatiu ) < 0 )
            {
                return false;
            }
            
            position++;
        });
        
        spatii.insert( spatiuData, position );
        
        this.notifyObservers( 'addSpatiu', spatiuData, { position: position } );
        
        if( !hasSpatii )
        {
            this.notifyObservers( 'hasSpatii' );
        }
        
        this._checkParametriSpatiu();
    },
    
    removeSpatiu: function( spatiuData )
    {
        var scaraId = this.getSpatiuInfo( spatiuData.id ).scara_id,
            spatii = this._getSpatiiPointer( scaraId );
    
        spatii.remove( function( currentValue ){
            return currentValue.id == spatiuData.id;
        });
        
        spatiuData.scara_id = scaraId;
        
        this.notifyObservers( 'removeSpatiu', spatiuData );
        
        if( !this.hasSpatii() )
        {
            this.notifyObservers( 'hasNoSpatii' );
        }
        
        this._checkParametriSpatiu();
    },
    
    editSpatiu: function( spatiuData )
    {
        var spatiuPointer, scaraId;
        
        scaraId = this.getSpatiuInfo( spatiuData.id ).scara_id;
        spatiuPointer = this._getSpatiuPointer( spatiuData.id );
        
        this.getPredefinedParametriSpatiu().each( function( parametru )
        {
            delete spatiuPointer[ parametru.code ];
        });
        
        Object.extend( spatiuPointer, spatiuData );
        
        spatiuData.scara_id = scaraId;
        
        this.notifyObservers( 'editSpatiu', spatiuData );
        
        this._checkParametriSpatiu();
    },
    
    getSpatii: function( scaraId )
    {
        var spatiiData = [];
        
        if( scaraId === undefined )
        {
            this._getBlocuriPointer().each( function( blocData )
            {
                blocData.scari.each( function( scaraData )
                {
                    spatiiData.add( Object.clone( scaraData.spatii, true ) );
                });
            });
        }
        else
        {
            var pointer = this._getSpatiiPointer( scaraId );
            
            spatiiData = Object.clone( pointer, true ) || [];
        }
        
        return spatiiData;
    },
    
    getBlocuriCount: function()
    {
        return this._getBlocuriPointer().length;
    },
    
    getScariCount: function( blocId )
    {
        var count = 0;
        
        this._getBlocuriPointer().each( function( blocData ){
            if( blocId === undefined )
            {
                count += blocData.scari.length;
            }
            else if( blocData.bloc_id == blocId )
            {
                count = blocData.scari.length;
                
                return false;
            }
        });
        
        return count;
    },

    getSpatiiCount: function( scaraId )
    {
        var count = Object.size( this._getSpatiiPointer( scaraId ) );
        
        return count;
    },
    
    getSpatiiScaraCount: function( spatii, scaraId )
    {
        var self = this,
            count = 0;
        
        Object.each( spatii, function( i, spatiuId )
        {
            var spatiuScaraId = self._getSpatiuPointer( spatiuId ).scara_id;
            
            if( spatiuScaraId == scaraId )
            {
                count++;
            }
        });
        
        return count;
    },
    
    getTotalSpatiiCount: function()
    {
        return this._getAllSpatii().length;
    },
    
    getScari: function( blocId )
    {
        var scari = [];
        
        this._getBlocuriPointer().each( function( blocData )
        {
            if( blocId === undefined )
            {
                blocData.scari.each( function( scaraData )
                {
                    var sd = Object.clone( scaraData );

                    scari.push( sd );
                });
            }
            else if( blocData.id == blocId )
            {
                scari = Object.clone( blocData.scari );
                
                return false;
            }
        });
        
        return scari;
    },
    
    getPersoaneCount: function( spatii )
    {
        var self = this,
            count = 0;
        
        Object.each( spatii, function( i, spatiuId )
        {
            var spatiuData = self._getSpatiuPointer( spatiuId ),
                persoaneSpatiu = Number.toNumber( spatiuData.nr_pers ) || 0;
                
            count += persoaneSpatiu;
        });
        
        return count;
    },
    
//    /**
//     * Returneaza parametrii care sunt folositi in cadrul spatiilor
//     * 
//     * Mod de calcul:
//     * - se preiau toti parametrii definiti
//     * - se elimina cei care nu sunt folositi in cadrul niciunui spatiu
//     */
//    getParametriSpatiu: function()
//    {
//        var self = this,
//            predefinedParametri = this.getPredefinedParametriSpatiu(),
//            parametri = [];
//        
//        predefinedParametri.each( function( parametru )
//        {
//            if( self.parametriSpatiuFlags[ parametru.code ] )
//            {
//                parametri.push( parametru );
//            }
//        });
//        
//        return parametri;
//    },
//
//    getParametruInfo: function( parametruCode )
//    {
//        var predefinedParametri = this.getPredefinedParametriSpatiu(),
//            parametruInfo = null;
//        
//        predefinedParametri.each( function( parametru )
//        {
//            if( parametru.code == parametruCode  )
//            {
//                parametruInfo = Object.clone( parametru );
//                
//                return false;
//            }
//        });
//        
//        return parametruInfo;
//    },
    
    getAllSpatii: function()
    {
        return Object.clone( this._getAllSpatii() );
    },
    
    getScariIds: function( blocId )
    {
        var scari = [];
        
        this._getBlocuriPointer().each( function( blocData )
        {
            if( blocId === undefined || blocData.id == blocId )
            {
                blocData.scari.each( function( scaraData )
                {
                    var scaraId = scaraData.id;

                    scari.push( scaraId );
                });
            }
        });
        
        return scari;
    },
    
    getBlocuriIds: function()
    {
        var blocuriIds = [];
        
        this._getBlocuriPointer().each( function( blocData )
        {
            blocuriIds.push( blocData.id );
        });
        
        return blocuriIds;
    },
    
    /**
     * @param options { abreviat [true|false] }
     */
    getDenumireBloc: function( blocId, options )
    {
        options = Object.extend({
            abreviat:   true
        }, Object.makeObject( options ) );
        
        var denumire = '',
            bloc = this._getBlocPointer( blocId ),
            denumireBloc = bloc.denumire;
    
        denumire = 
                ( options.abreviat ? 'Bl.' : 'Bloc' ) +
                ' ' +
                denumireBloc;
        
        return denumire;
    },
    
    /**
     * @param options { abreviat [true|false]; bloc [true|false] }
     */
    getDenumireScara: function( scaraId, options )
    {
        options = Object.extend({
            abreviat:   true,
            bloc:       true
        }, Object.makeObject( options ) );
        
        var denumire = '',
            scara = this._getScaraPointer( scaraId ),
            denumireScara = scara.denumire,
            blocId = scara.bloc_id;
    
        denumire = 
                ( options.bloc ? ( this.getDenumireBloc( blocId ) + ', ' ) : '' ) +
                ( options.abreviat ? 'Sc.' : 'Scara' ) +
                ' ' +
                denumireScara;
        
        return denumire;
    },
    
    /*--- internal functions ---*/
    
    _sortStructuraByDenumire: function()
    {
        // ordonare blocuri
        this._data.blocuri = this._getBlocuriPointer().sortBy( function( b ){
            return b.denumire;
        });
        
        // ordonare scari
        this._getBlocuriPointer().each( function( blocData ){
            blocData.scari = blocData.scari.sortBy( function( b ){
                return b.denumire;
            });
        });
        
        // ordonare spatii
        this._getBlocuriPointer().each( function( blocData ){
            blocData.scari.each( function( scaraData ){
                scaraData.spatii = scaraData.spatii.sortBy( function( s ){
                    return s.etaj_order + ' ' + s.numar;
                });
            });
        });
    },

    _getBlocuriPointer: function()
    {
        return this.getDataPointer().blocuri;
    },
    
    _getParametriSpatiuPointer: function()
    {
        return this._data.parametri_spatiu;
    },
    
    _getBlocPointer: function( blocId )
    {
        var pointer;
        
        this._getBlocuriPointer().each( function( blocData ){
            if( blocData.id == blocId )
            {
                pointer = blocData;
                
                return false;
            }
        });
        
        return pointer;
    },
    
    _getScariPointer: function( blocId )
    {
        var pointer;
        
        pointer = this._getBlocPointer( blocId ).scari;
                
        return pointer;
    },
    
    _getScaraPointer: function( scaraId )
    {
        var pointer;
        
        this._getBlocuriPointer().each( function( blocData ){
            blocData.scari.each( function( scaraData ){
                if( scaraData.id == scaraId )
                {
                    pointer = scaraData;

                    return false;
                }
            });
            
            if( pointer ) return false;
        });
        
        return pointer;
    },
    
    _getSpatiiPointer: function( scaraId )
    {
        var pointer;
        
        pointer = this._getScaraPointer( scaraId ).spatii;
        
        return pointer;
    },
    
    _getSpatiuPointer: function( spatiuId )
    {
        var pointer;
        
        this._getBlocuriPointer().each( function( blocData ){
            blocData.scari.each( function( scaraData ){
                scaraData.spatii.each( function( spatiuData ){
                    if( spatiuData.id == spatiuId )
                    {
                        pointer = spatiuData;

                        return false;
                    }
                });
                
                if( pointer ) return false;
            });
            
            if( pointer ) return false;
        });
        
        return pointer;
    },
    
    _getAllSpatii: function()
    {
        var spatii = [];
        
        this._getBlocuriPointer().each( function( blocData ){
            blocData.scari.each( function( scaraData ){
                spatii = spatii.union( scaraData.spatii );
            });
        });
        
        return spatii;
    },
    
    _initParametriSpatiuFlags: function()
    {
        var self = this,
            predefinedParametri = this.getPredefinedParametriSpatiu(),
            spatii = this._getAllSpatii();
    
        predefinedParametri.each( function( parametru )
        {
            self.parametriSpatiuFlags[ parametru.code ] = false;
        });
        
        Object.each( self.parametriSpatiuFlags, function( parametruCode, parametruLabel )
        {
            spatii.each( function( spatiu )
            {
                if( spatiu[ parametruCode ] !== undefined && spatiu[ parametruCode ].toNumber() )
                {
                    self.parametriSpatiuFlags[ parametruCode ] = true;
                    
                    return false;
                }
            });
        });
    },
    
    _checkParametriSpatiu: function()
    {
        var self = this,
            oldFlags = Object.clone( this.parametriSpatiuFlags ),
            parametru;
        
        this._initParametriSpatiuFlags();
        
        Object.each( oldFlags, function( parametruCode, oldValue )
        {
            var newValue = self.parametriSpatiuFlags[ parametruCode ];
            if( newValue != oldValue )
            {
                parametru = null;
                
                self.getPredefinedParametriSpatiu().each( function( parametruData )
                {
                    if( parametruData.code == parametruCode )
                    {
                        parametru = parametruData;
                        
                        return false;
                    }
                });
                
                parametru && self.notifyObservers( newValue ? 'newParametru' : 'discardParametru', parametru );
            }
        });
    }
        
});
