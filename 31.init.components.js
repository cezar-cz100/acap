
(function() {
////////////////////////////////////////////////////////////////////////////////
// SUPPORT FOR CLASSES /////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

// The base Class implementation (does nothing)
var Class = function(){};

var initializing = false, 
    fnTest = /xyz/.test( function(){ xyz; }) ?
        /\b_super\b/ :
        /.*/;

// The base Class implementation (does nothing)
//Class = function(){};

// Create a new Class that inherits from this class
Class.extend = function ( prop ) 
{
    var _super = this.prototype;

    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;

    // Copy the properties over onto the new prototype
    for ( var name in prop ) {
        // Check if we're overwriting an existing function
        prototype[name] = typeof prop[name] == "function" &&
                typeof _super[name] == "function" && fnTest.test( prop[name] ) ?
                ( function ( name, fn ) {
                    return function () {
                        var tmp = this._super;

                        // Add a new ._super() method that is the same method
                        // but on the super-class
                        this._super = _super[name];

                        // The method only need to be bound temporarily, so we
                        // remove it when we're done executing
                        var ret = fn.apply( this, arguments );
                        this._super = tmp;

                        return ret;
                    };
                } )( name, prop[name] ) :
                prop[name];
    }

    // The dummy class constructor
    function _Class() 
    {
        // All construction is actually done in the init method
        if ( !initializing && this.init )
        {
            var obj = this;

            // check for abstract methods
            var abstractMethodsStack = Class._getHierarchy( obj, '__abstract' );

            abstractMethodsStack.each( function( abstractMethods )
            {
                if( Object.isArray( abstractMethods ) )
                {
                    abstractMethods.each( function( methodName )
                    {
                        if( !Object.isFunction( obj[ methodName ] ) )
                        {
                            System.exception( ExceptionCodes.ABSTRACT_METHOD, { method: methodName } );
                        }
                    });
                }
            });

            // check for interface methods
            var interfaceMethodsStack = Class._getHierarchy( obj, '__interface' );

            interfaceMethodsStack.each( function( interfaceMethods )
            {
                if( Object.isArray( interfaceMethods ) )
                {
                    interfaceMethods.each( function( methodName )
                    {
                        if( !Object.isFunction( obj[ methodName ] ) )
                        {
                            System.exception( ExceptionCodes.INTERFACE_METHOD, { method: methodName } );
                        }
                    });
                }
            });

            // run the contructor
            this.init.apply( this, arguments );
        }
    }

    // Populate our constructed prototype object
    _Class.prototype = prototype;

    // Enforce the constructor to be what we expect
    _Class.prototype.constructor = _Class;

    // And make this class extendable
    _Class.extend = arguments.callee;

    _Class.isExtendedFrom = function ( BaseClass )
    {
        return Class.isExtendedFrom( this, BaseClass );
    };

    prototype._parentPrototype_ = _super;

    prototype._runHierarchy = function( methodName, args, callback )
    {
        var obj             = this,
            methodsStack    = Class._getHierarchy( obj, methodName );
    
        if( Object.isFunction( args ) )
        {
            callback = args;
            args = [];
        }

        // run methods
        methodsStack.each( function( method )
        {
            if( Object.isFunction( method ) )
            {
                var returnValue = method.apply( obj, args );

                Object.isFunction( callback ) && callback( returnValue );
            }
        });
    };

    return _Class;
};

Class.isExtendedFrom = function( constructorClass, baseClass ) 
{
    if ( !Object.isConstructor( constructorClass ) )
    {
        return false;
    }
    else
    {
        return ( constructorClass === baseClass ) || ( constructorClass.prototype instanceof baseClass );
    }
};

Class.isInstanceOf = function( object, _class )
{
    return object instanceof _class;
};

Class.extendFrom = function( ParentClass )
{
    var NewClass = function(){};
    
    NewClass.prototype = new ParentClass;
    NewClass.prototype.constructor = NewClass;
    
    return NewClass;
};

Class._getHierarchy = function( obj, propertyName )
{
    var prototype, property, lastProperty, stack;

    prototype = obj.constructor.prototype;
    stack = [];

    do
    {
        property = prototype[ propertyName ];

        if( property != lastProperty )
        {
            stack.unshift( property );
            lastProperty = property;
        }

        prototype = prototype._parentPrototype_;
    }
    while( typeof prototype != 'undefined' );

    return stack;
};

/**
 * Implement Singleton pattern
 * @param UserClass
 * @params arguments passed to UserClass constructor
 * 
 */
Class.Singleton = function( UserClass )
{
    if( !Class.isExtendedFrom( UserClass, Class ) )
    {
        System.exception( ExceptionCodes.INVALID_ARGUMENT, { type: 'Class' });
    }

    UserClass.prototype.Instance = null;
    UserClass.getInstance = (function( ctorArgsFunc )
    {
        return function()
        {
            if( UserClass.prototype.Instance === null )
            {
                var ctorArgs = [];

                if( typeof ctorArgsFunc != 'undefined' )
                {
                    if( Object.isFunction( ctorArgsFunc ) )
                    {
                        ctorArgs = ctorArgsFunc();
                    }

                    if( !Object.isArray( ctorArgs ) )
                    {
                        System.exception( ExceptionCodes.INVALID_ARGUMENT, { type: 'Array' } );
                    }
                }

                var ctorArgsCode = '',
                    ctorArgsList = [];

                ctorArgs.each( function( v, i ){
                    ctorArgsList.push( 'ctorArgs[' + i + ']' );
                });

                ctorArgsCode = ctorArgsList.join(', ');

                var Instance = eval( 'new UserClass( ' + ctorArgsCode + ' )' );

                UserClass.prototype.Instance = Instance;
            }

            return UserClass.prototype.Instance;
        };
    })( arguments[ 1 ] );
};

//==============================================================================

var ComponentEventConstructor = Class.extend(
{
    init: function()
    {
        this._handlerArguments = [];
        this._isAborted = false;
        this._values = {};
    },
    
    setArguments: function( args )
    {
        if( !Object.isArray( args ) )
        {
            throw new Error( "'args' should be an Array." );
        }
        
        this._handlerArguments = args;
    },
    
    getArguments: function()
    {
        return this._handlerArguments;
    },
    
    abort: function()
    {
        this._isAborted = true;
    },
    
    isAborted: function()
    {
        return this._isAborted;
    },
    
    setValue: function( value )
    {
        Object.extend( this._values, value );
    },
    
    getValues: function()
    {
        return this._values;
    }
    
});

//==============================================================================

var MaskConstructor = Class.extend(
{
    init: function()
    {
        this.$mask = $( this.elementSelector )
                .remove()
                .removeAttr( 'id' );
    },
    
    getClone: function( options )
    {
        options = options || {};
                
        var $clone = this.$mask.clone();
        
        if( options.parent )
        {
            $clone.prependTo( options.parent );
            
            if( ! $( options.parent ).is( document.body ) )
            {
                $clone.find( '.mask' ).css( 'position', 'absolute' );
            }
            
        }
        
        return $clone;
    }
});

var ContainerMaskClass = MaskConstructor.extend(
{
    elementSelector: '#container-mask'
});

var LoadingMaskClass = MaskConstructor.extend(
{
    elementSelector: '#loading-mask'
});

//==============================================================================

var StorageClass = Class.extend(
{
    init: function()
    {
        this._storage = {};
    },
    
    get: function( key )
    {
        return this._storage[ key ];
    },
    
    has: function( key )
    {
        return typeof this._storage[ key ] != 'undefined';
    },
    
    store: function( key, value )
    {
        this._storage[ key ] = value;
    },
    remove: function( key )
    {
        if (typeof this._storage[ key ] != 'undefined')
        {
            delete this._storage[ key ];
        }
    },
            
    getAll: function()
    {
        return this._storage;
    }
});

//==============================================================================

var ContainerClass = Class.extend(
{
    init: function( $container, options )
    {
        var self = this;
        
        this._loaded = false;
        this._eventHandlers = {};
        this._options = {};
        
        //----
        
        if( Class.isInstanceOf( $container, jQuery ) )
        {
            this.$container = $container;
            this.Context = null;
        }
        else if( Class.isInstanceOf( $container, ContainerClass ) )
        {
            this.$container = $container.getContainer();
            this.Context = $container;
        }
        else
        {
            System.exception( ExceptionCodes.INVALID_ARGUMENT, {
                    argument: '$container',
                    type: '_Component.Container, jQuery' 
            }, 3 );
        }

        if( !this.$container.size() )
        {
            System.exception( ExceptionCodes.BAD_ARGUMENT_AT_INSTANTIATION, { reason: 'Container element doesn\'t exist.' }, 3 );
        }

        //----
        
        options = Object.makeObject( options );

        var defaultOptions = {};
        
        this._runHierarchy( '_setDefaultOptions_', function( options )
        {
            Object.extend( defaultOptions, options );
        });

        this._options = Object.extend( Object.duplicate( defaultOptions ), Object.duplicate( options ) );
        
        //----

        this._extractEventHandlers();
        
        //----
        
        if( this._options.showLoadingMask )
        {
            this._initLoadingMask();
            this._showLoadingMask();
            this.addHandler( 'contentLoaded', this._removeLoadingMask );
        }

        //----
        
        this._setupTemplates();

        this._runHierarchy( '_setup_' );
        this._runHierarchy( '_setupElements_' );

        this._loadData( function(){
            
            self._runHierarchy( '_setupResources_' );
            self._runHierarchy( '_setupActions_' );

            self._runHierarchy( '_init_' );

            self.sendParameters( self._options );

            self._runHierarchy( '_end_' );
            
            self._loaded = true;
            self._trigger( 'contentLoaded' );
        });

    },
    
    _setDefaultOptions_: function()
    {
        return {
            deferContentLoading:    false,
            showLoadingMask:        false
        };
    },
    
    _setRequiredOptions: function( requiredOptions )
    {
        var self = this;
        
        requiredOptions.each( function( option )
        {
            if( self._options[ option ] === undefined )
            {
                System.exception( ExceptionCodes.OPTION_MISSING, { option: option } );
            }
        });
    },
    
    _loadData: function( callback )
    {
        if( Object.isFunction( this._loadData_ ) )
        {
            this._loadData_( callback );
        }
        else
        {
            callback.call( this );
        }
    },
    
    _end_: function()
    {
        this.getContainer().removeClass( 'container-view' );
    },
    
    _extractEventHandlers: function()
    {
        var self = this;
        
        Object.each( this._options, function( key, value ){
            if( Object.isString( key ) && key.startsWith( /on[A-Z]/ ) )
            {
                var eventName = key.from( 2 ).lowerCaseFirst(),
                    handler = value;
                
                self.addHandler( eventName, handler );
                
                delete self._options[ key ];
            }
        });
    },
            
    addHandler: function( eventName, handler )
    {
        var self = this,
            eventHandlers = {};
        
        if( Object.isObject( eventName ) )
        {
            eventHandlers = eventName;
        }
        else
        {
            if( Object.isArray( eventName ) )
            {
                eventName = eventName.join( ' ' );
            }
            
            eventHandlers[ eventName ] = handler;
        }
        
        Object.each( eventHandlers, function( eventName, handler )
        {
            var eventNames = eventName.split( /\s+/ );
            
            eventNames.each( function( eventName )
            {
                eventName = eventName.trim();

                if ( Object.isFunction( handler ) )
                {
                    if ( typeof self._eventHandlers[ eventName ] == 'undefined' || !Object.isArray( self._eventHandlers[ eventName ] ) )
                    {
                        self._eventHandlers[ eventName ] = [];
                    }

                    self._eventHandlers[ eventName ].push( handler );
                }
            });
        });
        
        return this;
    },

    _trigger: function( eventName )
    {
        var self = this,
            args = Array.prototype.slice.call( arguments, 1 ),
            event = new ComponentEventConstructor();
        
        event.setArguments( args );
        
        if( Object.isArray( this._eventHandlers[ eventName ] ) )
        {
            this._eventHandlers[ eventName ].each( function( handler ){
                handler.apply( self, [ event ].add( args ) );
                
                if( event.isAborted() )
                {
                    return false;
                }
            });
        }
        
        return event;
    },
    
    _triggerDOM: function( eventName )
    {
        var args = Array.prototype.slice.call( arguments, 1 ),
            event = $.Event( eventName );
    
        if( args.length == 0 )
        {
            args = [ this.getContainer() ];
        }
    
        this.getContainer().trigger( event, args );
    },
        
    setOptions: function( options )
    {
        $.extend( this._options, options );
        
        return this;
    },
    
    _initLoadingMask: function()
    {
        this.$loadingMask = System.loadingMask({
            parent: this.getContainer()
        });
    },
    
    _showLoadingMask: function()
    {
        this.getContainer().addClass( 'loading-contents' );
        
        var zIndex = this.$loadingMask.siblings().map( function(){ return $(this).zIndex() } ).get().max();
        
        this.$loadingMask.show();
        this.$loadingMask.zIndex( zIndex );
    },
    
    _removeLoadingMask: function()
    {
        this.getContainer().removeClass( 'loading-contents' );
        
        this.$loadingMask.hide();
        this.$loadingMask.zIndex( '' );
        
    },
    
    // show an overlay over the container
    disable: function()
    {
        if( !this.$containerMask )
        {
            this.$containerMask = System.containerMask({
                parent: this.getContainer()
            });
        }
        
        this.getContainer().addClass( 'disabled-container' );
        
        if( this.getContainer().css( 'position' ) == 'static' )
        {
            this.getContainer().css( 'position', 'relative' );
        }
        
        this.$containerMask.show();
    },
    
    enable: function()
    {
        if( this.$containerMask )
        {
            this.$containerMask.hide();
        }
        
        this.getContainer().removeClass( 'disabled-container' );
    },
    

    reset: function()
    {
        this._runHierarchy( '_reset_' );
        
        return this;
    },
    
    refresh: function()
    {
        this._runHierarchy( '_refresh_' );
        
        return this;
    },
    
    getContainer: function()
    {
        return this.$container;
    },
    
    find: function( selector )
    {
        var $element = $(selector, this.$container);
        
        return $element;
    },
    
    bind: function()
    {
        var c = this.getContainer();
                
        c.on.apply( c, arguments );
        
        return this;
    },
    
    show: function()
    {
        this.getContainer().show();
        this._runHierarchy( '_show_' );
        
        return this;
    },
    
    hide: function()
    {        
        this.getContainer().hide();
        this._runHierarchy( '_hide_' );
        
        return this;
    },
            
    getOption: function( option, defaultValue )
    {
        var value = this._options[ option ];
        
        if( value === undefined )
        {
            value = defaultValue;
        }
        
        return value;
    },
    
    setOption: function( option, value )
    {
        this._options[ option ] = value;
        
        return this;
    },
            
    getOptions: function()
    {
        return this._options;
    },
            
    isVisible: function()
    {
        var $c = this.getContainer();
        
        return $c.is(':visible') && ( $c.width() || $c.height() );
    },
     
    _setupTemplates: function()
    {
        if( this.getContainer().data( 'templates' ) ) return;
        
        var $templates = this.getContainer().find( '.template' );
        
        this.getContainer().data( 'templates', $templates );
    },
    
    _getTemplate: function( templateClass )
    {
        var $template = this.getContainer().data( 'templates' ).filter( '.' + templateClass ),
            $clone = $template.removeClass( 'template' ).remove().clone();

        return $clone;
    },
    
    sendParameters: function( params )
    {
        params = Object.makeObject( params );
        
        this._runHierarchy( '_parameters_', [ params ] );
        
        return this;
    },
    
    isLoaded: function()
    {
        return this._loaded;
    },
    
    hangup: function()
    {
        this._runHierarchy( '_hangup_' );
    }
    
    
});

//==============================================================================

var __FormClass = ContainerClass.extend(
{
    _setupElements_: function()
    {
        this.$form = this.$container.is('form') ?
            this.$container:
            this.$container.find('form');
    },
    
    _init_: function()
    {
        if( !this.$form.size() )
        {
            System.exception( ExceptionCodes.BAD_ARGUMENT_AT_INSTANTIATION, { reason: 'Container element doesn\'t contain a <form> element.' } );
        }
    },
    
    _getForm: function()
    {
        return this.$form;
    },

    getValues: function()
    {
        var self = this,
            values = this._getForm().formParams();
        
//        Object.each( values, function( name, value )
//        {
//            var $field = self.getField( name );
//            
//            if( $field.is( ':radio' ) )
//            {
//                values[ name ] = $field.filter( ':checked' ).val();
//            }
//        });
        
        return values;
    },
    
    getField: function( name, startWith )
    {
        if ( typeof startWith == 'undefined' )
        {
            startWith = false;
        }
        
        var $field = $('[name="'+name+'"]', this.$form);

        if( !$field.length && startWith )
        {
            $field = $('[name^="'+name+'["]', this.$form).eq(0);
        }
        
        return $field;
    },

    _reset_: function()
    {
        this.$form[0].reset();
    }

});

//------------------------------------------------------------------------------

var RequestFormClass = __FormClass.extend(
{
    _setup_: function()
    {
        if( typeof this._options.action !== 'undefined' )
        {
            this.action = this._options.action;
        }
        
        if( typeof this.action === 'undefined' )
        {
            throw new Error( '"action" is not defined' );
        }
    },

    _setupActions_: function()
    {
        this._bindSubmit();
    },
    
    _bindSubmit: function()
    {
        var self = this;

        this._getForm().on( 'submit', function( event ){
            event.preventDefault();
            
            var formValues = self.getValues();
            var event = self._trigger( 'beforeSubmit', formValues );

            if( !event.isAborted() )
            {
                self._doSubmit();
            }
        });
    },
    
    _doSubmit: function()
    {
        var self    = this,
            params  = this.getValues(),
            action  = this.action;

        System.request({
            action: action,
            params: params,
            onSuccess: function( responseData )
            {
                var event = self._trigger( 'success', responseData );
                if( event.getValues().hideLoader === false )
                {
                    return false;
                }
            },
            onErrors: function( errors )
            {
                var event = self._trigger( 'errors', errors );
            }
        });
        
    },
    
    _showErrors: function( errors )
    {
        System.alert( errors );
    },
    
    submit: function()
    {
        this.$form.submit();
    }
    
});

//------------------------------------------------------------------------------

var StaticFormClass = __FormClass.extend(
{
    _setupActions_: function()
    {
        this._getForm().on( 'submit', function( event ){
            event.preventDefault();
        });
    }
    
});

//==============================================================================

var DialogClass = ContainerClass.extend(
{
    _setDefaultOptions_: function()
    {
        return {
            autoOpen:   false,
            modal:      true,
            resizable:  false,
            draggable:  false,
            closeOnEscape: false,
            width:      'auto',
            height:     'auto',
            atPosition: 'center',
            myPosition: 'center'
        };
    },
    
    _setup_: function()
    {
        var self = this;
        
        this._opened = false;
        this.closeButonVisible = true;
        this.closeOptions = null;
    },
    
    _setupActions_: function()
    {
        var self = this;
        
        this.getContainer().on('dialogclose', function()
        {
            self._opened = false;
            
            self._trigger( 'close', self.closeOptions );
        });
        
        this.getContainer().on('dialogopen', function()
        {
            self._opened = true;
            
            self.refresh();
        });
        
        this.getContainer().on( 'dialogbeforeclose', function( event )
        {
            if( event.originalEvent && $( event.originalEvent.target ).closest( self._getCloseButton() ).size() && !self.closeButonVisible )
            {
                return false;
            }
        });
        
        $(window).on( 'resize', function(){
            if( self._isOpened() )
            {
                self.refresh();
            }
        });
        
    },
    
    _setupResources_: function()
    {
        this.getContainer().show();
        this.getContainer().dialog( this._options );
    },
    
    _hideTitleBar: function()
    {
        var $title = this.getTitlebarElement();
        $title.hide();
    },
    
    showTitleBar: function()
    {
        var $title = this.getTitlebarElement();
        $title.show();
    },
    
    _hideCloseButton: function()
    {
        this.closeButonVisible = false;
        this._getCloseButton().hide();
    },
    
    _showCloseButton: function()
    {
        this.closeButonVisible = true;
        this._getCloseButton().show();
    },
    
    _destroy: function()
    {
        this.getDialogElement().remove();
    },
    
    setTitle: function( title )
    {
        title = $.trim( title );
        
        var $titleBar = this.getDialogElement().find('.ui-dialog-titlebar');
        var $title = $titleBar.find('.ui-dialog-title');
        
        if ( title.length )
        {
            $title.show().text( title );
        }
        else
        {
            $title.html( '&nbsp;' );
        }
    },
    
    setOptions: function( options )
    {
        this.$container.dialog( 'option', options );
    },
    
    close: function( options )
    {
        this.closeOptions = options;
        
        this.$container.dialog( 'close' );
        
        this._runHierarchy( '_close_', [ options ] );
    },
    
    open: function( options )
    {
        var event = this._trigger( 'beforeOpen', options );
        
        if( !event.isAborted() )
        {
            this._runHierarchy( '_open_', [ options ] );
            this.sendParameters( options );
            
            this.$container.dialog( 'open' );
        }
    },
    
    _isOpened: function()
    {
        return this._opened;
    },
    
    getDialogElement: function()
    {
        var $dialog = this.$container.closest('.ui-dialog');
        
        return $dialog;
    },
    
    _getTitlebarElement: function()
    {
        if ( typeof this.$titleBar == 'undefined' )
        {
            this.$titleBar = this.getDialogElement().find('.ui-dialog-titlebar');
        }
        
        return this.$titleBar;
    },
    
    _getCloseButton: function()
    {
        var $button = this._getTitlebarElement().find( '.ui-dialog-titlebar-close' );
        
        return $button;
    },
    
    _getTitle: function()
    {
        return this._getTitlebarElement().find( '.ui-dialog-title' ).text().trim();
    },
    
    _refresh_: function()
    {
        var self = this;

        this.getContainer().dialog( 'option', 'position', { my: this._options.myPosition, at: this._options.atPosition, of: window } );

    },
            
    _getOverlay: function()
    {
        return $( '>.ui-widget-overlay', document.body );
    }
});

//==============================================================================

var RequestClass = Class.extend(
{
    init: function()
    {
        this.$mask = System.loadingMask().prependTo( document.body );
    },
    
    /**
     * 
     * @param Object command {
     *      - action
     *      - params
     *      - loader [true]
     *      - method ['post']
     *      - onSuccess
     *      - onErrors
     * }
     */
    send: function( command )
    {
        var self = this;
        
        var url = '/api/' + command.action;
        
        var data = Object.makeObject( command.params );
        
        if( !command.excludeToken )
        {
            data.token = this._getToken();
        }
        
        var now = new Date();
        data.client_time = now.formatISO();
        
        var displayLoader = command.loader || ( typeof command.loader === 'undefined' );
        if( displayLoader )
        {
            this._showProgress();
        }
                
        $.ajax({
            //timeout: 30000,
            url:    url,
            data:   data,
            dataType: 'json',
            type: ( typeof command.method != 'undefined' ) ? command.method : 'post',
            async: true,
            success: function( response )
            {
                //self._hideProgress();
                if( response && $.isPlainObject( response ) )
                {
                    if ( response.success )
                    {
                        var hideProgress = true;
                        if( Object.isFunction( command.onSuccess ) )
                        {
                            hideProgress = command.onSuccess.call( self, response.data );
                        }
                        
                        if( hideProgress !== false )
                        {
                            self._hideProgress();
                        }
                    }
                    else if( response.errors )
                    {
                        // check for 'not_authenticated' error
                        var authenticationError = false;
                        
                         response.errors.each( function( error ){
                            if( error.code == 'not_authenticated' )
                            {
                                authenticationError = true;
                                
                                self._displayErrors( error.message, function(){
                                    $('body').empty();
                                    window.location.reload();
                                });
                                
                                return false;
                            }
                        });
                        
                        if( !authenticationError )
                        {
                            self._displayErrors( response.errors );
                            command.onErrors && command.onErrors.call( self, response.errors );
                        }
                    }
                }
                else
                {
                    self._displayErrors( 'Ne pare rău, a apărut o problemă tehnică.' );
                    command.onErrors && command.onErrors.call( self );
                }
            },
            error: function()
            {
                self._displayErrors( 'Ne pare rău, a apărut o problemă tehnică.' );
                command.onErrors && command.onErrors.call( self );
            },
            complete: function()
            {
                // se executa dupa `success` sau `error`
            }
        });
    },
    
    _getToken: function()
    {
        return $('#request-token').val();        
    },
    
    _showProgress: function()
    {
        var zIndex = this.$mask.siblings().map( function(){ return $(this).zIndex() } ).get().max();
        
        this.$mask.show();
        this.$mask.zIndex( zIndex + 1 );
    },
    
    _hideProgress: function()
    {
        this.$mask.hide();
        this.$mask.zIndex( '' );
    },
    
    _displayErrors: function( errors )
    {
        this._hideProgress();
        
        var errorMessages = Object.isArray( errors ) ? 
                errors.valuesFromKey( 'message' ) :
                errors;
        
        System.alert( errorMessages );
    }
    
});

//==============================================================================

var InfoDialogClass = DialogClass.extend(
{
    _setup_: function()
    {
        this._options.timeout = 5000;
        this._options.minHeight = 0;
        this._options.modal = false;
        this._options.autoClose = true;
        this._options.atPosition = 'top+13';
        this._options.myPosition = 'top';
        this._options.dialogClass = 'info-ballon-dialog';
    },
    
    _init_: function()
    {
        var self = this;
        
        this._timeout = null;
        
        this.$content = this.find( '.content' );
        
        this.bind( 'mouseenter', function(){
            if( self._options.autoClose )
            {
                self.close();
            }
        })
    },
    
    show: function( message, options )
    {
        if( arguments.length == 0 )
        {
            return this;
        }
        else
        {
            var self = this;

            options = Object.makeObject( options );

            this.$content.html( message );

            this.setOption( 'modal', false );
            this.open();

            if( options.autoClose !== undefined )
            {
                this._options.autoClose = options.autoClose;
            }
            else
            {
                this._options.autoClose = true;
            }
            
            if( options.warning )
            {
                this.getContainer().addClass( 'warning' );
            }
            else
            {
                this.getContainer().removeClass( 'warning' );
            }
            
            if( this._options.autoClose )
            {
                clearTimeout( this._timeout );
                this._timeout = setTimeout( function(){
                    self.close();
                }, this._options.timeout);
            }
        }
    },
    
    close: function()
    {
        clearTimeout( this._timeout );
        this._super.apply( this, arguments );
    }
});

//==============================================================================

var AlertDialogClass = DialogClass.extend(
{
    _init_: function()
    {
        var self = this;
        
        this._callback = null;
        
        this.$button = this.find( '.ok-button' );
        this.$button.on( 'click', function(){
            if( self._runCallback() !== false )
            {
                self.close();
            }
        });
        
        this.$content = this.find( '.content' );
    },
    
    show: function( message, callback )
    {
        var content = this._buildContent( message );
        
        this.$content.html( content );
        this._callback = callback;
        
        this.open();
    },
    
    close: function()
    {
        this._callback = null;
        this._super.apply( this, arguments );
    },
    
    _runCallback: function()
    {
        if( Object.isFunction( this._callback ) )
        {
            this._callback.call( this );
        }
    },
    
    _buildContent: function( message )
    {
        var content = '';
        
        if( Object.isScalar( message ) )
        {
            content = message;
        }
        else
        {
            content = Object.values( message ).compact().join( '<br />' );
        }
        
        return content;
    }
    
});

//==============================================================================

var ConfirmDialogClass = DialogClass.extend(
{
    _init_: function()
    {
        var self = this;
        
        this._callbacks = {
            yes: null,
            no: null
        };
        
        this.$buttons = {
            yes:    this.find( '.yes-button' ),
            no:     this.find( '.no-button' )
        };
        
        Object.each( this.$buttons, function( value, $button ){
            $button.on( 'click', function(){
                if( self._runCallback( value ) !== false )
                {
                    self.close();
                }
            });
        });
        
        this.$content = this.find( '.content' );
    },
    
    show: function( message, callbacks )
    {
        this.$content.html( message );
        
        if( !Object.isObject( callbacks ) )
        {
            System.exception( ExceptionCodes.UNEXPECTED_VALUE, { argument: 'callback' } );
        }
        
        if( !Object.isFunction( callbacks.yes ) && !Object.isFunction( callbacks.no ) )
        {
            System.exception( ExceptionCodes.UNDEFINED_PARAMETER, { parameter: 'callback for YES or NO options' }, 3 );
        }
        
        this._callbacks = callbacks;
        
        this.open();
    },
    
    close: function()
    {
        this._callbacks = {
            yes: null,
            no: null
        };
        
        this._super.apply( this, arguments );
    },
    
    _runCallback: function( value )
    {
        if( Object.isFunction( this._callbacks[ value ] ) )
        {
            this._callbacks[ value ].call( this );
        }
    }
    
});

//==============================================================================

/**
 * #options#
 * - defaultPane: 
 *      specifies what pane will be initially visible; 
 *      the value is the "pane-id" data attribute of the container element
 * - paneConstructors: 
 *      an object containing pairs of paneId:paneConstructor; 
 *      paneConstructor takes the correponding pane container element as its first argument when it is instantiated;
 *      paneConstructor can be an array in which the first value is the constructor itself and the second is a set of options passed to the contructor when iti is instantiated;
 * - $tabsContainer
 * 
 * #methods#
 * - showPane( paneId, paneArgs )
 * 
 *  #events#
 *  - showPane( paneId )
 */
var PanesClass = ContainerClass.extend(
{
    _setDefaultOptions_: function()
    {
        return {
            paneConstructors:       {},
            paneConstructorClass:   _Components.Container
        };
    },
    
    _setup_: function()
    {
        this.currentPaneId = null;
        this.disabledPanes = [];
                
    },
    
    _setupResources_: function()
    {
        this._setupPanes();
        this._setupTabs();
    },
    
    _end_: function()
    {
        this._showDefaultPane();
    },

    _reset_: function()
    {
        this.currentPaneId = null;
        this.disabledPanes = [];
        
        Object.each( this.Panes, function( paneId, Pane ){
            Pane.reset();
        });
        
        this._hidePanes();
        this._showDefaultPane();
    },
    
    
    showPane: function( paneId, paneArgs, callback )
    {
        var self = this;
        
        if( this._isPaneDisabled( paneId ) )
        {
            return;
        }
        
        var $pane = this._getPaneElement( paneId );
        
        if( !$pane.size() )
        {
            return;
        }
        
        if( this.currentPaneId == paneId )
        {
            // just send arguments
            var Pane = this._getPaneObject( paneId );
            
            if( Pane )
            {
                Pane.sendParameters( paneArgs );
            }
        }
        else
        {
            this.currentPaneId = paneId;

            this._selectTab( paneId );

            this._hidePanes();
            $pane.show();

            var afterFn = function()
            {
                var Pane = self._getPaneObject( paneId );
                
                if( Pane )
                {
                    Pane.show();
                }
                
                Object.isFunction( callback ) && callback.call( self, Pane ? Pane : undefined );
                
                self._trigger( 'showPane', paneId, Pane );
            };

            if( this._paneClassExists( paneId ) )
            {
                if( this._isPaneLoaded( paneId ) )
                {
                    this._getPaneObject( paneId ).sendParameters( paneArgs );

                    afterFn();
                }
                else
                {
                    this._loadPane( paneId, $pane, paneArgs, afterFn );
                }
            }
            else
            {
                afterFn();
            }
        }

    },
    
    getCurrentPaneId: function()
    {
        return this.currentPaneId;
    },
    
    disablePanes: function( paneIds )
    {
        var self = this;
        
        paneIds.each( function( paneId )
        {
            if( !self._isPaneDisabled( paneId ) )
            {
                self.disabledPanes.push( paneId );
                self._disableTab( paneId );
            }
        });
        
    },
    
    enablePanes: function( paneIds )
    {
        var self = this;
        
        paneIds.each( function( paneId )
        {
            if( self._isPaneDisabled( paneId ) )
            {
                self.disabledPanes.remove( paneId );
                self._enableTab( paneId );
            }
        });
        
    },
    
    getPane: function( paneId )
    {
        return this._getPaneObject( paneId );
    },
    
    hidePanes: function()
    {
        this._hidePanes();
        
        this.currentPaneId = null;
    },
    
    _setupPanes: function()
    {
        var self = this;
        
        // store pane elements
        this.$panes = this.getContainer().children();

        // $panes must have only one child
        this.$panes.each( function(){
            self._checkPaneContent( $(this) );
        });
        
        this.paneIds = [];
        
        // store pane ids
        this.$panes.each( function(){
            var paneId = $(this).data( 'id' );
            self.paneIds.push( paneId );
        });

        this.Panes = {};
    },
    
    _checkPaneContent: function( $pane )
    {
        var $paneContents = $pane.contents(),
            contentSize = 0,
            $paneChildren = $pane.children(),
            paneId = this._getPaneId( $pane ),
            childrenSize = $paneChildren.size();

        $paneContents.each( function(){
            if( ( this.nodeType == Node.ELEMENT_NODE ) ||
                ( this.nodeType == Node.TEXT_NODE && !this.textContent.isBlank() ) )
            {
                contentSize++;
            }
        });

        if( contentSize != 1 || childrenSize != 1 )
        {
            System.error( 'Pane "{p}" must contain a single element.'.assign({ p: paneId }) );
        }
    },
    
    _setupTabs: function()
    {
        var self = this;
        var _$tabs = $();
        
        if( this._options.$tabsContainer )
        {
            _$tabs = this._options.$tabsContainer.children();
            
            // bind actions to each tab
            // disable tabs that don't have a corresponding pane
            _$tabs.each( function()
            {
                var $tab = $(this),
                    tabId = $tab.data( 'id' );
                    
                if( self.paneIds.indexOf( tabId ) < 0 )
                {
                    $tab.addClass( 'disabled' );
                }
                
                $tab.on( 'click', function(){
                    if( !$(this).hasClass( 'disabled' ) )
                    {
                        self.showPane( tabId );
                    }
                });
            });
        }
        
        this.$tabs = _$tabs;
    },
    
    /**
     * Displays a default pane, if any
     */
    _showDefaultPane: function()
    {
        var defaultPaneId = this._options.defaultPane;
        
        if( this._paneExists( defaultPaneId ) )
        {
            this.showPane( defaultPaneId );
        }
    },
    
    _loadPane: function( paneId, $pane, paneArgs, callback )
    {
        var self = this,
            $paneContent = $pane.children(),
            constructorOptions = {},
            PaneConstructor = this._options.paneConstructors[ paneId ];
        
        if( !Object.isFunction( callback ) )
        {
            callback = function(){};
        }
        
        if( typeof PaneConstructor === 'undefined' )
        {
            this.Panes[ paneId ] = false;
            
            Object.isFunction( callback ) && callback.call( this );
        }
        else
        {
            if( Object.isArray( PaneConstructor ) )
            {
                constructorOptions = Object.duplicate( PaneConstructor[ 1 ] );
                PaneConstructor = PaneConstructor[ 0 ];
            }

            if( !Class.isExtendedFrom( PaneConstructor, this._options.paneConstructorClass ) )
            {
                System.error( 'Pane constructor class is not valid.' );
            }

            Object.extend( constructorOptions, paneArgs );

            var Pane = new PaneConstructor( $paneContent, constructorOptions );
            this.Panes[ paneId ] = Pane;

            if( Pane.isLoaded() )
            {
                this._trigger( 'loadPane', paneId, Pane );
                callback.call( Pane );
            }
            else
            {
                Pane.addHandler( 'contentLoaded', function()
                {
                    self._trigger( 'loadPane', paneId, Pane );
                    callback.call( Pane );
                });
            }
        }
    },
    
    _getPaneElement: function( paneId )
    {
        var $pane = this.$panes.filter( function(){
            return $(this).data( 'id' ) == paneId;
        });
        
        return $pane;
    },
    
    _getPaneId: function( $pane )
    {
        var paneId = $pane.data( 'id' );
        
        return paneId;
    },
    
    _getPaneIdOfTab: function( $tab )
    {
        var paneId = $tab.data( 'id' );
        
        return paneId;
    },
    
    _getTabs: function()
    {
        return this.$tabs;
    },
    
    _getTabElement: function( paneId )
    {
        var $tab = this._getTabs().filter( '[data-id="'+ paneId +'"]' );
        
        return $tab;
    },
    
    _selectTab: function( paneId )
    {
        this._getTabs().removeClass( 'current' );
        this._getTabElement( paneId ).addClass( 'current' );
    },
    
    _hidePanes: function()
    {
        this.$panes.hide();
    },
    
    _paneClassExists: function( paneId )
    {
        return typeof this._options.paneConstructors[ paneId ] !== 'undefined';
    },
    
    _paneExists: function( paneId )
    {
        return this.paneIds.indexOf( paneId ) >= 0;
    },
    
    _isPaneLoaded: function( paneId )
    {
        return this.Panes[ paneId ] instanceof _Components.Container;
    },
    
    _getPaneObject: function( paneId )
    {
        return this.Panes[ paneId ] || null;
    },
    
    getCurrentPaneObject: function()
    {
        var paneId = this.getCurrentPaneId();
        
        return this.Panes[ paneId ] || null;
    },
    
    _isPaneDisabled: function( paneId )
    {
        var disabled = this.disabledPanes.indexOf( paneId ) >= 0;
        
        return disabled;
    },
    
    _disableTab: function( tabId )
    {
        var $tab = ( tabId instanceof $ ) ? tabId : this._getTabElement( tabId );
        
        $tab.addClass( 'disabled' );
    },
    
    _enableTab: function( tabId )
    {
        var $tab = ( tabId instanceof $ ) ? tabId : this._getTabElement( tabId );
        
        $tab.removeClass( 'disabled' );
    },
    
    _isTabDisabled: function( tabId )
    {
        var $tab = ( tabId instanceof $ ) ? tabId : this._getTabElement( tabId );
        
        return $tab.hasClass( 'disabled' );
    },
    
    _disableAllTabs: function()
    {
        this._getTabs().addClass( 'disabled' );
    },
    
    _addPane: function( $paneContent, paneId, paneConstructor )
    {
        var $pane;
        
        $pane = $( '<div class="pane-wrapper">' ).data( 'id', paneId );
        $pane.html( $paneContent );
        
        $pane.appendTo( this.getContainer() );
        this.paneIds.push( paneId );
        
        this.$panes = this.$panes.add( $pane );
        
        this._options.paneConstructors[ paneId ] = paneConstructor;
    },
    
    _addAndLoadPane: function( $paneContent, paneId, paneConstructor )
    {
        this._addPane( $paneContent, paneId, paneConstructor );
        
        this._loadPane( paneId, this._getPaneElement( paneId ) );
    },
    
    _removePane: function( paneId )
    {
        var $pane;
        
        delete this._options.paneConstructors[ paneId ];
        
        $pane = this._getPaneElement( paneId );
        
        this.$panes = this.$panes.not( $pane );
        $pane.remove();
    },
    
    _hangup_: function()
    {
        Object.each( this.Panes, function( paneId, Pane )
        {
            Pane.hangup();
        });
    }        
    
    
});

//==============================================================================

var ApplicationClass = ContainerClass.extend(
{
    _setup_: function()
    {
        this._resources = {};
        
        this.loading = true;
    },
    
    _end_: function()
    {
        this._stopLoading();
        this._showApplication();
    },
    
    _showApplication: function()
    {
        $( '#application-canvas' ).show();
    },
    
    _stopLoading: function()
    {
        this.loading = false;
        $( '#body-overlay' ).hide();
    },
    
    command: function()
    {
        if( this.CommandManager instanceof CommandManagerClass )
        {
            this.CommandManager.run.apply( this.CommandManager, arguments );
        }
    }
     
});

//==============================================================================

var CommandClass = Class.extend(
{
    __interface: [ 'run' ],
    
    init: function()
    {
        this._runHierarchy( '_init_' );
    }
    
});

var CommandManagerClass = Class.extend(
{
    init: function()
    {
        this.Context = arguments[ 0 ];
        
        this._commands = {};
        
        this._init_();
        
        this._defineCommands();
    },
    
    _init_: function(){},
    
    _defineCommands: function()
    {
        throw new Error( 'method is not defined' );
    },
    
    _add: function( name, fn )
    {
        this._commands[ name ] = fn;
    },
    
    run: function( commandName )
    {
        var command = this._commands[ commandName ],
            commandArgs = Array.prototype.slice.call( arguments, 1 );
        
        if( Object.isFunction( command ) )
        {
            command.apply( this, Array.prototype.slice.call( arguments, 1 ) );
        }
        else if( Class.isInstanceOf( command, CommandClass ) )
        {
            command.run.apply( command, commandArgs );
        }
        else
        {
            System.error( 'Unknown command: ' + commandName );
        }
    }
});

//==============================================================================

var __ResourceClass = Class.extend(
{
    init: function( options )
    {
        this._options = options || {};
        
        this._eventHandlers = {};
        
        this._data = null;
        
        this._runHierarchy( '_init_' );
    },
    
    reset: function()
    {
        this._data = null;
        
        this._runHierarchy( '_reset_' );
    },
    
    getDataPointer: function()
    {
        return this._data;
    },
    
    getData: function()
    {
        return Object.clone( this._data, true );
    },

    isEmpty: function()
    {
        return Object.isEmpty( this._data );
    },
    
    storeById: function( data )
    {
        var storage = {};
        
        Object.each( data, function( i, item )
        {
            var id = item.id;
            
            storage[ id ] = item;
        });
        
        return storage;
    },
    
    registerObserver: function( eventHandlers )
    {
        var self = this;
        
        Object.each( eventHandlers, function( eventNames, handler ){
            eventNames = eventNames.split( /\s+/ );
            eventNames.each( function( eventName )
            {
                if( typeof self._eventHandlers[ eventName ] === 'undefined' )
                {
                    self._eventHandlers[ eventName ] = $.Callbacks();
                }

                self._eventHandlers[ eventName ].add( handler );
            });
        });
    },
    
    /**
     * 
     * @param string eventName
     * @params mixed arguments
     */
    notifyObservers: function( eventName, args__ )
    {
        var args = Array.prototype.slice.call( arguments, 1 ),
            handlers = this._eventHandlers[ eventName ];
            
        handlers && handlers.fire.apply( this, args );
    }
    
});

//------------------------------------------------------------------------------

var ApiResourceClass = __ResourceClass.extend(
{
    _init_: function()
    {
        this.faulty = false;
        this.errors = null;
        
        this.load();
    },
    
    load: function()
    {
        var self = this;
        
        if( typeof this._action === 'undefined' )
        {
            System.exception( ExceptionCodes.UNDEFINED_PARAMETER, { parameter:  'action' } );
        }
        
        this.reset();
        
        System.request({
            action: self._action,
            loader: false,
            onSuccess: function( data )
            {
                self._data = data;
                
                self._runHierarchy( '_end_', [ data ] );
                Object.isFunction( self._options.onLoad ) && self._options.onLoad.call( self, data );
            },
            onErrors: function( errors )
            {
                self.faulty = true;
                self.setErrors( errors );
                Object.isFunction( self._options.onErrors ) && self._options.onErrors.call( self, errors );
            }
        });
    },
    
    _reset_: function()
    {
        this.faulty = false;
        this.errors = null;        
    },
    
    isFaulty: function()
    {
        return this.faulty;
    },
    
    isLoaded: function()
    {
        return ( this._data !== null );
    },
    
    setErrors: function( errors )
    {
        this.errors = errors;
    },
    
    getErrors: function()
    {
        return this.errors;
    }
        
});

//------------------------------------------------------------------------------

var StaticResourceClass = __ResourceClass.extend(
{
    _init_: function()
    {
        if( this._options.data === undefined )
        {
            System.exception( ExceptionCodes.OPTION_MISSING, { option: 'data' } );
        }
        
        this._data = Object.clone( this._options.data, true );
    }
    
});

//==============================================================================

var DataValidatorClass = Class.extend(
{
    __interface: [ 'isValid', 'getData', 'getError' ],
    
    __abstract: [ '_validate' ],
    
    init: function( Context )
    {
        this.data = null;
        this.Context = Context;
        
        this.reset();
        
        this._runHierarchy( '_init_' );
    },
    
    isValid: function()
    {
        this.reset();
        
        try
        {
            var filteredData = this._validate();
            
            if( this._hasError() )
            {
                throw new ValidatorError;
            }
            else if( filteredData !== undefined )
            {
                this._setData( filteredData );
            }
        }
        catch( errorException )
        {
            if( !( errorException instanceof ValidatorError ) )
            {
                throw errorException;
            }
        }
        
        return !this._hasError();
    },
    
    getData: function()
    {
        return this._data;
    },
    
    getError: function()
    {
        return this._error;
    },
    
    reset: function()
    {
        this._error = null;
        this._data = null;
        
        this._runHierarchy( '_reset_' );
    },
    
    _setError: function( message )
    {
        this._error = message;
        
        throw new ValidatorError();
    },
    
    _addError: function( message )
    {
        if( !Array.isArray( this._error ) )
        {
            this._error = Object.isEmpty( this._error ) ? [] : [ this._error ];
        }
        
        this._error.add( message );
    },
    
    _setData: function( data )
    {
        this._data = data;
    },
    
    _hasError: function()
    {
        return !Object.isEmpty( this._error );
    },
    
    _attachValidator: function( Validator )
    {
        if( Validator.isValid() )
        {
            this._setData( Validator.getData() );
        }
        else
        {
            this._setError( Validator.getError() );
        }
    }
    
});

var ValidatorError = Class.extendFrom( Error );

//==============================================================================

var ModelClass = Class.extend(
{
    init: function( Controller )
    {
        this.Controller = Controller;
        
        this._runHierarchy( '_setup_' );
        this._runHierarchy( '_init_' );
    },
    
    reset: function()
    {
        this._runHierarchy( '_reset_' );
    }
    
});

//==============================================================================

var TooltipClass = ContainerClass.extend(
{
    _init_: function()
    {
        this.getContainer().tooltip({
            tooltipClass:   'application-tooltip',
            position:       { my: 'right top', at: 'left top' },
            show:           false,
            hide:           false
        });
    }
});

//==============================================================================

$.widget( 'ui.selectmenu', $.ui.selectmenu,
{
    _setText: function( element, value )
    {
        var content = Object.isBlank( value ) ?
                "&#160;" :
                value;
        
        element.html( content );
    },
    
    _renderItem: function( ul, item )
    {
        var $item = this._super( ul, item );
        
        if( item.element.hasClass( 'placeholder' ) )
        {
            $item.addClass( 'placeholder' );
        }
        
        return $item;
    }
});

var SelectMenuClass = ContainerClass.extend(
{
    __interface: [ 'getValue', 'setValue' ],
    
    _setup_: function()
    {
        this.currentValue = null;
    },
    
    _setupElements_: function()
    {
        var $container = this.getContainer();
        this.$select = $container.is( 'select' ) ? $container : $container.find( '.select' );
    },
    
    _init_: function()
    {
        var self = this;
        
        this.createPlaceholder();
        this.createWidget();
        
        this.Instance = this.runWidgetMethod( 'instance' );
        
        this.setupWidgetElements();
        
        this.regenerate();
    },
    
    generateContent: function(){},
    
    createWidget: function()
    {
        var self = this;
        
        this.$select.selectmenu({
            select: function( event, ui )
            {
                var text = self.getSelectText( ui.item.element );
                
                self.setSelectText( text );
            },
            change: function( event, ui )
            {
                self.triggerSelect();
            },
            position: {
                collision: 'flip'
            }
        });
    },
    
    setupWidgetElements: function()
    {
        this.$selectMenuText = this.Instance.buttonText;
        this.$menuWrapper = this.Instance.menuWrap;
    },
    
    createPlaceholder: function()
    {
        var placeholder = this.$select.attr( 'placeholder' );
        
        if( placeholder !== undefined )
        {
            this.$select.prepend( $( '<option class="placeholder" selected value="">' + placeholder + '</option>' ) );
        }
    },
    
    setSelectText: function( text )
    {
        this.Instance._setText( this.$selectMenuText, text );
    },
    
    addItem: function( itemData )
    {
        var $option = $( '<option>' ),
            optionContent;
        
        optionContent = Array.create( itemData.label )
                .map( function( label ) {
                        return label.escapeHTML();
                })
                .join( '<br />' );
        
        $option.text( optionContent );
        $option.val( itemData.value );
        $option.data( 'select-text', itemData.selectText );
        
        $option.appendTo( this.$select );
    },
    
    runWidgetMethod: function( method, args )
    {
        return this.$select.selectmenu.apply( this.$select, arguments );
    },
    
    _reset_: function()
    {
        var $options = this.$select.children(),
            $placeholder = $options.filter( '.placeholder' );
        
        $placeholder.prop( 'selected', true );
        
        this.resetSelectText();
        
        this.currentValue = this.getValue();
    },
    
    reloadItems: function()
    {
        this.Instance._refreshMenu();
    },
    
    removeOptions: function()
    {
        this.$select.children().not( '.placeholder' ).remove();
    },
    
    resetSelectText: function()
    {
        this.setSelectText( this.getSelectText( this.getSelectedOption() ) );
    },
    
    getSelectedOption: function()
    {
        return this.$select.find( ':selected' );
    },
    
    getSelectText: function( $option )
    {
        var selectText,
            text = $option.data( 'select-text' );
            
        selectText = text !== undefined ?
                text :
                $option.text();
        
        return selectText;
    },
    
    getValue: function()
    {
        return this.$select.val();
    },
    
    setValue: function( value )
    {
        this.selectItem( value );
    },
    
    selectItem: function( value )
    {
        this.$select.val( value );
        this.resetSelectText();
        this.currentValue = value;
    },
    
    regenerate: function()
    {
        var self = this,
            contentData = this.generateContent();
        
        if( Object.isArray( contentData ) )
        {
            this.removeOptions();
            
            var data = contentData[0],
                iterator = contentData[1];
            
            Object.each( data, function( i, itemData )
            {
                self.addItem( iterator( itemData ) );
            });

            this.reloadItems();        
        }
        
        this.resetSelectText();
    },
    
    triggerSelect: function()
    {
        var newValue = this.getValue();
        
        if( newValue !== this.currentValue )
        {
            this.currentValue = newValue;
            this._trigger( 'select', newValue );
        }
    }
    
});


//==============================================================================

_Components = 
{
    Class:          Class,
    ContainerMask:  ContainerMaskClass,
    LoadingMask:    LoadingMaskClass,
    Request:        RequestClass,
    Dialog:         DialogClass,
    InfoDialog:     InfoDialogClass,
    AlertDialog:    AlertDialogClass,
    ConfirmDialog:  ConfirmDialogClass,
    StaticForm:     StaticFormClass,
    RequestForm:    RequestFormClass,
    Panes:          PanesClass,
    Application:    ApplicationClass,
    Command:        CommandClass,
    CommandManager: CommandManagerClass,
    ApiResource:    ApiResourceClass,
    StaticResource: StaticResourceClass,
    Container:      ContainerClass,
    DataValidator:  DataValidatorClass,
    Model:          ModelClass,
    Tooltip:        TooltipClass,
    SelectMenu:     SelectMenuClass,

    Storage:        StorageClass
};

})();
