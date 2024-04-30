System.error = function( message )
{
    console.error( message );
};

System.exception = function( exceptionCode, messageParams, level )
{
    var message = exceptionCode[ 1 ].assign( messageParams ),
        stackLevel = level || exceptionCode[ 2 ] || 8,
        err,
        E = new Error( message ),
        stackArray = E.stack.split( "\n" );
    
    if( stackLevel !== undefined )
    {
        var trace = E.stack.split( "\n" )[ stackLevel ],
            parts = trace.split( ':' ),
            columnNumber = parts[ 3 ],
            lineNumber = parts[ 2 ],
            fileName = ( parts[ 0 ] + ':' + parts[ 1 ] ).split( '@' )[ 1 ],
            stackArray = stackArray.from( stackLevel ),
            stack = stackArray.from( stackLevel ).join( "\n" );
            
        
        var _ExceptionConstructor = function( params )
        {
            Object.extend( this, params );
        }
        _ExceptionConstructor.prototype = Object.create( Error.prototype );
        
        err = new _ExceptionConstructor({
            code:           exceptionCode,
            fileName:       fileName,
            lineNumber:     lineNumber,
            columnNumber:   columnNumber,
            message:        message,
            stack:          stack
        });
    }
    else
    {
        err = E;
    }
    
    throw err;
};

// define System methods
$(function(){
    
    System.loadingMask      = Function.methodProxy( new _Components.LoadingMask(), 'getClone' );
    System.containerMask    = Function.methodProxy( new _Components.ContainerMask(), 'getClone' );
    System.request  = Function.methodProxy( new _Components.Request(), 'send' );
    System.alert    = Function.methodProxy( new _Components.AlertDialog( $('#alert-dialog') ), 'show' );
    System.confirm  = Function.methodProxy( new _Components.ConfirmDialog( $('#confirm-dialog') ), 'show' );
    System.info     = Function.methodProxy( new _Components.InfoDialog( $('#info-dialog') ), 'show' );
    
});
