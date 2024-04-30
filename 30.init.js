/**
 * Namespace that holds base component classes
 */
var _Components = {};


/**
 * Object that represents the entire application
 * 
 * @type ApplicationConstructor
 */
var Application;

/**
 * Class that models the application
 */
var ApplicationConstructor;

/**
 * Namespace that holds various application classes
 */
var _Application = {};

/**
 * Object for loading and accessing resources
 */
var DataResource = {};

/**
 * Namespace that holds resource classes
 */
var _DataResources = {};

/**
 * Object that contain system functions
 */
var System = {};

var ExceptionCodes = {};

////////////////////////////////////////////////////////////////////////////////

window.onload = function(){
    if( _Components.Class.isExtendedFrom( ApplicationConstructor, _Components.Application ) )
    {
        Application = new ApplicationConstructor( $('body') );
    }
    else
    {
        System.error( '"ApplicationConstructor" is not defined or is invalid.' );
    }
};
