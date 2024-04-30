(function(){

_Application.Commands = _Components.CommandManager.extend(
{
    _init_: function()
    {
        this.Logout         = new _Application.Logout();
        this.AddCheltuiala  = new _Cheltuieli.AddCheltuialaCommand();
        this.OpenPage       = new OpenPageCommand();
    },
    
    _defineCommands: function()
    {
        this._add( 'logout', function(){
            this.Logout.logout();
        });
        
        this._add( 'add-cheltuiala', this.AddCheltuiala );
        
        this._add( 'open-page', this.OpenPage )
    }
});

//==============================================================================
    
var OpenPageCommand = _Components.Command.extend(
{
    run: function( page, pageOptions )
    {
        Application.closeOperatingDialogs();
        
        Application.openPage( page, pageOptions );
    }
});

})();