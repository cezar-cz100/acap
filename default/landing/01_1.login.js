(function(){

_Application.Login = _Components.RequestForm.extend(
{
    action: 'login',

    _setup_: function()
    {
        this.addHandler( 'beforeSubmit', function( event )
        {
            var errors = {},
                params = event.getArguments()[ 0 ];

            if ( params.username.isBlank() )
            {
                errors.username = 'Completați codul fiscal al Asociaţiei.';
            }

            if ( params.password.isBlank() )
            {
                errors.password = 'Specificați parola.';
            }

            if ( Object.size( errors ) )
            {
                this._showErrors( errors );

                event.abort();
            }
            
        });
        
        this.addHandler( 'success', function( event )
        {
            // do a redirect
            location.reload();

            // force loader to not hide
            event.setValue({
                hideLoader: false
            });
        });
    }
    
});

})();
