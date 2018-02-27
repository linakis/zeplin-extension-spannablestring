function layer(context, layer) {
    if (!shouldShowExtension(layer)) {
        return
    }

    var styleGuideColor = false;
    if (context.getOption("use_styleguide_colors")) {
        styleGuideColor = context.getOption("use_styleguide_colors");
    }

    var output = 'SpannableString spString = new SpannableString(' + JSON.stringify(layer.content) + ');\n';
    var superTextStyle = computeSuperTextStyle(layer);

    output += spannify(superTextStyle.range, superTextStyle.textStyle, null, {}, colorDroid(superTextStyle.textStyle.color, styleGuideColor, context.project));

    for (var i in layer.textStyles) {
        var previousTextStyle = i > 0 ? layer.textStyles[i - 1].textStyle : null;
        output += spannify(layer.textStyles[i].range, layer.textStyles[i].textStyle, previousTextStyle, superTextStyle.textStyle, colorDroid(layer.textStyles[i].textStyle.color, styleGuideColor, context.project));
    }

    return {
        code: output,
        language: "java"
    };
}

function spannify(range, textStyle, appliedTextStyle, superTextStyle, colorDroid) {

    appliedTextStyle = appliedTextStyle || {};

    var ret = "";

    if (!compare(textStyle, superTextStyle, "color") && !compare(textStyle, appliedTextStyle, "color")) {
        ret += 'spString.setSpan(new ForegroundColorSpan(' + colorDroid + '), ' + range.start + ', ' + range.end + ', Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);\n'
    }

    if (!compare(textStyle, superTextStyle, "fontFace") && !compare(textStyle, appliedTextStyle, "fontFace")) {
        ret += 'spString.setSpan(new TypefaceSpan("' + textStyle.fontFace + '"), ' + range.start + ', ' + range.end + ', Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);\n'
    }

    if (!compare(textStyle, superTextStyle, "fontSize") && !compare(textStyle, appliedTextStyle, "fontSize")) {
        ret += 'spString.setSpan(new AbsoluteSizeSpan(' + Math.round(textStyle.fontSize) + '), ' + range.start + ', ' + range.end + ', Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);\n'
    }

    // TODO: AlignmentSpan -> textAlign,
    // TODO: UnderlineSpan -> fontStyle,
    // TODO: BackgroundColorSpan -> ?,
    // TODO: StrikethroughSpan -> ?,
    // TODO: LineHeightSpan -> lineHeight
    // TODO: StyleSpan -> weightText
    // TODO: ? -> fontStretch

    return ret;
}

function colorDroid(color, useStyleGuideColor, projectContext) {
    if (useStyleGuideColor) {
        var styleGuideColor = projectContext.findColorEqual(color);
        if(styleGuideColor && styleGuideColor.name) {
            return 'ContextCompat.getColor(context, R.color.' + styleGuideColor.name + ')';
        }
    }
    return 'Color.parseColor("' + colorToHex(color) + '")';
}

function compare(left, right, attr) {

    left = left || {};
    right = right || {};

    if (attr == "color" && left[attr] != null && right[attr] != null) {
        return left[attr].a === right[attr].a
            && left[attr].r === right[attr].r
            && left[attr].g === right[attr].g
            && left[attr].b === right[attr].b
    }

    return left[attr] == right[attr];
}

// no point in showing Spannable logic
// if we have a single textStyle in the
// entire label. That's what the xml is for.
function shouldShowExtension(layer) {
    return layer.textStyles != null && layer.textStyles.length > 1
}

function colorToHex(color) {
    if (color) {
        return "#" + ((1 << 24) + (color.r << 16) + (color.g << 8) + color.b).toString(16).slice(1);
    }
    return ""
}

function computeSuperTextStyle(layer) {
    if (!shouldShowExtension) {
        return {}
    }

    // initialize with our initial textStyle
    // every-time we find a difference in one of the attributes
    // we will exclude it from our output.
    // this way we will end up with a an object
    // that contains only the attributes that are common between all
    // of our textStyles. We also hard code the range to include the entire length
    var superTextStyle = {
        range: {
            start: 0,
            end: layer.content.length
        },
        textStyle: {
            fontSize: layer.textStyles[0].textStyle.fontSize,
            fontFace: layer.textStyles[0].textStyle.fontFace,
            color: layer.textStyles[0].textStyle.color
        }
    };

    for (var i = 0; i < layer.textStyles.length; ++i) {
        if (!compare(superTextStyle.textStyle, layer.textStyles[i].textStyle, "fontSize")) {
            delete superTextStyle.textStyle.fontSize
        }

        if (!compare(superTextStyle.textStyle, layer.textStyles[i].textStyle, "fontFace")) {
            delete superTextStyle.textStyle.fontFace
        }

        if (!compare(superTextStyle.textStyle, layer.textStyles[i].textStyle, "color")) {
            delete superTextStyle.textStyle.color
        }
    }

    return superTextStyle;
}
