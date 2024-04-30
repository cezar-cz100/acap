var _Welcome = {};

_Welcome.Module = _Components.Container.extend(
{
    _setupElements_: function()
    {
        this.$continue = this.find( '.continue-button' );
    },
    
    _setupActions_: function()
    {
        var self = this;
        
        this.$continue.on( 'click', function()
        {
            self._trigger( 'continue' );
        });
    }
    
});
