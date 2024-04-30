_Application.Logout = _Components.Class.extend(
{
    logout: function()
    {
        var self = this;
        
        System.confirm( 'Doriți să părăsiți aplicația?', {
            yes: self._action
        });
    },
    
    _action: function()
    {
        System.request({
            action: 'logout',
            excludeToken: true,
            onSuccess: function()
            {
                location.reload();

                return false;
            }
        });
    }
});
