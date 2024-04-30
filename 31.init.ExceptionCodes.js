;
/** Abstract method not implemented: "{method}" */
ExceptionCodes.ABSTRACT_METHOD  = [ 10, 'Abstract method not implemented: "{method}"' ];

/** Invalid argument provided in method call. It should be of type: "{type}" */
ExceptionCodes.INVALID_ARGUMENT = [ 11, 'Invalid argument "{argument}" provided in method call. It should be of type: "{type}"', 1 ];

/** The following option is missing in constructor call: "{option}" */
ExceptionCodes.OPTION_MISSING   = [ 12, 'The following option is missing in constructor call: "{option}"' ];

/** Unexpected value for argument "{argument}": {value} */
ExceptionCodes.UNEXPECTED_VALUE = [ 13, 'Unexpected value for argument "{argument}": {value}', 1 ];

/** Parameter not defined: "{parameter}" */
ExceptionCodes.UNDEFINED_PARAMETER = [ 14, 'Parameter not defined: "{parameter}"', 1 ];

/** Interface method not implemented: "{method}" */
ExceptionCodes.INTERFACE_METHOD  = [ 15, 'Interface method not implemented: "{method}"' ];

/** Invalid class provided for {className}. */
ExceptionCodes.INVALID_CLASS  = [ 16, 'Invalid class provided for "{className}"', 1 ];

/** Execution halted: {reason} */
ExceptionCodes.HALT  = [ 17, 'Execution halted: {reason}', 1 ];

/** {custom reason} */
ExceptionCodes.BAD_ARGUMENT_AT_INSTANTIATION  = [ 18, '{reason}', 10 ];

/** {custom exception} */
ExceptionCodes.CUSTOM  = [ 19, '{message}', 1 ];

