(function(){

ApplicationConstructor = _Components.Application.extend(
{
    _setupResources_: function()
    {
        // load Login module
        this.Login = new _Application.Login( $( '#login-frame' ) );
        
    },
    
    _init_: function()
    {
        this._showApplication();
    }

});


})();
