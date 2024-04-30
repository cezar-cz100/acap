DataResource = 
{
    _resources: {},
    _loadOptions: {},
    
    get: function( resourceName )
    {
        var R = this._resources[ resourceName ],
            returnData;
        
        if( _Components.Class.isInstanceOf( R, _Components.ApiResource ) )
        {
            returnData = R;
        }
        else
        {
            System.exception( ExceptionCodes.UNEXPECTED_VALUE, { argument: 'Resource', value: resourceName } );
        }
        
        return returnData;
    },
    
    /**
     * 
     * @param {type} resourceNames Can be one or more resourses
     * @param {type} callback
     */
    load: function( resourceNames, callback, options )
    {
        var self = this,
            remainingResources = {};
        
        resourceNames = Array.create( resourceNames );
        
        this._loadOptions = Object.makeObject( options );
        
        resourceNames.each( function( resourceName )
        {
            remainingResources[ resourceName ] = true;
        });
        
        resourceNames.each( function( resourceName )
        {
            self._addResource( resourceName, {
                onLoad: function()
                {
                    checkIfAllResourcesAreLoaded( resourceName );
                }
            });
        });
        
        function checkIfAllResourcesAreLoaded( resourceName )
        {
            delete remainingResources[ resourceName ];
            
            if( Object.isFunction( callback ) && Object.isEmpty( remainingResources ) )
            {
                callback.call( self );
            }
        }
    },
    
    _addResource: function( resourceName, instanceOptions )
    {
        var self = this;
        
        if( _Components.Class.isExtendedFrom( _DataResources[ resourceName ], _Components.ApiResource ) )
        {
            instanceOptions.onErrors = function( errors )
            {
                self._throwError( errors );
            };
            
            var Resource = new _DataResources[ resourceName ]( instanceOptions );
            
            this._resources[ resourceName ] = Resource;
        }
        else
        {
            System.exception( ExceptionCodes.INVALID_CLASS ); // 'The class for "' + resourceName + '" data resource doesn\'t exist or is invalid.');
        }
    },
    
    _throwError: function( errors )
    {
        if( Object.isFunction( this._loadOptions.onErrors ) )
        {
            this._loadOptions.onErrors.call( this, errors );
        }
        
        System.exception( ExceptionCodes.HALT );
    }
    
};

////////////////////////////////////////////////////////////////////////////////

