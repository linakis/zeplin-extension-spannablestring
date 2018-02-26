function layer(context, layer) {
    if (!shouldShowExtension(layer)) {
        return
    }

    var output = 'SpannableString spString = new SpannableString(' + JSON.stringify(layer.content) + ');\n'

    for (var i in layer.textStyles) {
        var previousTextStyle = i > 0 ? layer.textStyles[i - 1].textStyle : null;
        output += spannify(layer.textStyles[i].range, layer.textStyles[i].textStyle, previousTextStyle);
    }

    return {
        code: output,
        language: "java"
    };
};

function spannify(range, textStyle, appliedTextStyle) {

    appliedTextStyle = appliedTextStyle || {};

    var ret = "";

    if (compareColors(textStyle.color, appliedTextStyle.color)) {
        ret += 'spString.setSpan(new ForegroundColorSpan(Color.parseColor("' + colorToHex(textStyle.color) + '")), ' + range.start + ', ' + range.end + ', Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);\n'
    }

    if (textStyle.fontFace !== appliedTextStyle.fontFace) {
        ret += 'spString.setSpan(new TypefaceSpan("' + textStyle.fontFace + '"), ' + range.start + ', ' + range.end + ', Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);\n'
    }

    if (textStyle.fontSize !== appliedTextStyle.fontSize) {
        ret += 'spString.setSpan(new AbsoluteSizeSpan(' + Math.round(textStyle.fontSize) + '), ' + range.start + ', ' + range.end + ', Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);\n'
    }

    if (textStyle.textAlign !== "center") {
        ret += 'spString.setSpan(new AlignmentSpan.Standard(Layout.Alignment.ALIGN_CENTER), ' + range.start + ', ' + range.end + ', Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);\n'
    }

    // TODO: UnderlineSpan, BackgroundColorSpan, StrikethroughSpan, StyleSpan, LineHeightSpan

    return ret;
}

function compareColors(colorA, colorB) {
    if (!colorA || !colorB) {
        return false
    }

    return colorA.a === colorB.a
        && colorA.r === colorB.r
        && colorA.g === colorB.g
        && colorA.b === colorB.b
}

// no point in showing Spannable logic
// if we have a single textStyle in the
// entire label. That's what the xml is for.
function shouldShowExtension(layer) {
    return layer.textStyles.length > 1
}

function colorToHex(color) {
    if (color) {
        return "#" + ((1 << 24) + (color.r << 16) + (color.g << 8) + color.b).toString(16).slice(1);
    }
    return ""
}