
////////////////////////////////////////////////////////////////////////////////
// define/update jQuery methods/////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

(function(){

    $.fn.outside = function( event, callback, $parent )
    {
        var $el = this;
        
        if ( typeof $parent == 'undefined' )
        {
            $parent = $(document);
        }
        
        $parent.on(event, function( e ){
            if ( !(e.originalEvent instanceof Event) ) return;
            
            var $target = $(e.target);
            
            if ( !$target.add( $target.parents() ).is( $el ) )
            {
                callback.call( $el );
            }
        });
        
    };
    
    $.fn.scrollTo = function ( target, options, callback ) 
    {
        if ( typeof options == 'function' && arguments.length == 2 ) 
        {
            callback = options;
            options = target;
        };
        
        var settings = $.extend( {
            scrollTarget: target,
            offsetTop: 50,
            duration: 0,
            easing: 'swing'
        }, options );
        
        return this.each( function () 
        {
            var scrollPane = $( this );
            var scrollTarget = ( typeof settings.scrollTarget == "number" ) ? settings.scrollTarget : $( settings.scrollTarget );
            var scrollY = ( typeof scrollTarget == "number" ) ? scrollTarget : scrollTarget.offset().top + scrollPane.scrollTop() - parseInt( settings.offsetTop );
            scrollPane.animate( { scrollTop: scrollY }, parseInt( settings.duration ), settings.easing, function () {
                if ( typeof callback == 'function' ) {
                    callback.call( this );
                }
            } );
        } );
    }
    
    $.widget("ui.dialog", $.ui.dialog, {
        options: 
        {
            headerVisible: false
        },
        _create: function () 
        {
            // ready to generate button
            this._super("_create");
            // decide if header is visible
            if( !this.options.headerVisible )
            {
                this.uiDialogTitlebar.hide();
            }
        },
        _setOption: function (key, value) 
        {
            this._super(key, value);
            if (key === "headerVisible") {
                if ( !value )
                    this.uiDialogTitlebar.hide();
                else
                    this.uiDialogTitlebar.show();
                return;
            }
        }
    });

    $.widget("ui.tooltip", $.ui.tooltip, {
        options: {
            content: function () {
                return $(this).prop('title');
            }
        }
    });    

})();

//=== $.fn.formParams ===//
(function ($) {
    var
            // use to parse bracket notation like my[name][attribute]
            keyBreaker = /[^\[\]]+/g,
            // converts values that look like numbers and booleans and removes empty strings
            convertValue = function (value) {
                if ($.isNumeric(value)) {
                    return parseFloat(value);
                } else if (value === 'true') {
                    return true;
                } else if (value === 'false') {
                    return false;
                } else if (value === '' || value === null) {
                    return undefined;
                }
                return value;
            },
            // Access nested data
            nestData = function (elem, type, data, parts, value, seen, fullName) {
                var name = parts.shift();
                // Keep track of the dot separated fullname. Used to uniquely track seen values
                // and if they should be converted to an array or not
                fullName = fullName ? fullName + '.' + name : name;

                if (parts.length) {
                    if (!data[ name ]) {
                        data[ name ] = {};
                    }

                    // Recursive call
                    nestData(elem, type, data[ name ], parts, value, seen, fullName);
                } else {

                    // Handle same name case, as well as "last checkbox checked"
                    // case
                    if (fullName in seen && type != "radio" && !$.isArray(data[ name ])) {
                        if (name in data) {
                            data[ name ] = [data[name]];
                        } else {
                            data[ name ] = [];
                        }
                    } else {
                        seen[ fullName ] = true;
                    }

                    // Finally, assign data
                    if ((type == "radio" || type == "checkbox") && !elem.is(":checked")) {
                        return
                    }

                    if (!data[ name ]) {
                        data[ name ] = value;
                    } else {
                        data[ name ].push(value);
                    }


                }

            };

    /**
     * @function jQuery.fn.formParams
     * @parent jQuery.formParams
     * @plugin jquerypp/dom/form_params
     * @test jquerypp/dom/form_params/qunit.html
     * @hide
     *
     * Returns a JavaScript object for values in a form.
     * It creates nested objects by using bracket notation in the form element name.
     *
     * @param {Object} [params] If an object is passed, the form will be repopulated
     * with the values of the object based on the name of the inputs within
     * the form
     * @param {Boolean} [convert=false] True if strings that look like numbers
     * and booleans should be converted and if empty string should not be added
     * to the result.
     * @return {Object} An object of name-value pairs.
     */
    $.fn.extend({
        formParams: function (params) {

            var convert;

            // Quick way to determine if something is a boolean
            if (!!params === params) {
                convert = params;
                params = null;
            }

            if (params) {
                return this.setParams(params);
            } else {
                return this.getParams(convert);
            }
        },
        setParams: function (params) {

            // Find all the inputs
            this.find("[name]").each(function () {
                var $this = $(this),
                        value = params[ $this.attr("name") ];

                // Don't do all this work if there's no value
                if (value !== undefined) {

                    // Nested these if statements for performance
                    if ($this.is(":radio")) {
                        if ($this.val() == value) {
                            $this.attr("checked", true);
                        }
                    } else if ($this.is(":checkbox")) {
                        // Convert single value to an array to reduce
                        // complexity
                        value = $.isArray(value) ? value : [value];
                        if ($.inArray($this.val(), value) > -1) {
                            $this.attr("checked", true);
                        }
                    } else {
                        $this.val(value);
                    }
                }
            });
        },
        getParams: function (convert) {
            var data = {},
                    // This is used to keep track of the checkbox names that we've
                    // already seen, so we know that we should return an array if
                    // we see it multiple times. Fixes last checkbox checked bug.
                    seen = {},
                    current;

            this.find("[name]:not(:disabled)").each(function () {
                var $this = $(this),
                        type = $this.attr("type"),
                        name = $this.attr("name"),
                        value = $this.val(),
                        parts;

                // Don't accumulate submit buttons and nameless elements
                if (type == "submit" || !name) {
                    return;
                }

                // Figure out name parts
                parts = name.match(keyBreaker);
                if (!parts.length) {
                    parts = [name];
                }

                // Convert the value
                if (convert) {
                    value = convertValue(value);
                }

                // Assign data recursively
                nestData($this, type, data, parts, value, seen);

            });

            return data;
        }
    });

})(jQuery);
