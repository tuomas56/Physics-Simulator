//custom elements
if ('registerElement' in document) {
    var XSliderProto = Object.create(HTMLElement.prototype);
    XSliderProto.createdCallback = function () {
        this.innerHTML = '<div data-role="slider" data-position="0" data-show-hint="true"></div>';
        $(this).find("div").addClass("slider").slider();

    };
    Object.defineProperty(XSliderProto, "percentage", {
        get: function () {
            return Math.round(($(this).find(".slider").find(".complete").width() / ($(this).find(".slider").width() - 12)) * 100);
        }
    });
    document.registerElement("x-slider", {
        prototype: XSliderProto
    });
}
