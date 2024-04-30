(function(){

_Cheltuieli.AddCheltuialaCommand = _Components.Command.extend(
{
    _init_: function()
    {
        this.Dialog = _Cheltuieli.AddCheltuialaDialog.getInstance();
    },
    
    run: function()
    {
        this.Dialog.open();
    }
});

})();
