function layer(context, layer) {
    if (!shouldShowExtension(layer)) {
        return
    }

    var output = 'SpannableString spString = new SpannableString(' + JSON.stringify(layer.content) + ');\n'

    for (var i in layer.textStyles) {
        output += spannify(layer.textStyles[i].range, layer.textStyles[i].textStyle);
    }

    return {
        code: output,
        language: "java"
    };
};

function spannify(range, textStyle) {

    var ret = "";

    ret += 'spString.setSpan(new ForegroundColorSpan(Color.parseColor("' + colorToHex(textStyle.color) + '")), ' + range.start + ', ' + range.end + ', Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);\n'

    ret += 'spString.setSpan(new TypefaceSpan("' + textStyle.fontFace + '"), ' + range.start + ', ' + range.end + ', Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);\n'

    ret += 'spString.setSpan(new AbsoluteSizeSpan("' + textStyle.fontSize + '"), ' + range.start + ', ' + range.end + ', Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);\n'

    if (textStyle.textAlign !== "center") {
        ret += 'spString.setSpan(new AlignmentSpan.Standard(Layout.Alignment.ALIGN_CENTER), ' + range.start + ', ' + range.end + ', Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);\n'
    }

    // TODO: UnderlineSpan, BackgroundColorSpan, StrikethroughSpan, StyleSpan, LineHeightSpan

    return ret;
}


function shouldShowExtension(layer) {
    return layer.textStyles.length > 1
}

function colorToHex(color) {
    return "#" + ((1 << 24) + (color.r << 16) + (color.g << 8) + color.b).toString(16).slice(1);
}