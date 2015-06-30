$(function () {
    var gameEngine = (function () {
        var _lines = 10, _columns = 10;

        function Field(line, column) {
            var sizeField = (100 / (_lines > _columns ? _lines : _columns)) + "%";
            return $("<button/>", {
                "class": "field",
                "style": "width: " + sizeField + "; height: " + sizeField
            }).data({
                "line": line,
                "column": column,
                "mine": false
            });;
        };
        function getField(line, column) {
            var field;
            $(".field").each(function () {
                if ($(this).data("line") == line && $(this).data("column") == column) {
                    field = $(this);
                    return;
                }
            });
            return field;
        };
        function generateMines(percentageMines) {
            var length = _lines * _columns / 100 * (percentageMines || 20);

            while (length > 0) {
                var line = Math.floor(Math.random() * _lines),
                    column = Math.floor(Math.random() * _columns);

                var field = getField(line, column);

                if (field.data("mine"))
                    continue;

                field.data("mine", true);
                length--;
            }
        };
        function fieldsSiblings(f) {
            var siblings = [];
            for (var l = f.data("line") - 1; l <= f.data("line") + 1; l++)
                for (var c = f.data("column") - 1; c <= f.data("column") + 1; c++)
                    if (l != f.data("line") || c != f.data("column"))
                        siblings.push(getField(l, c));
            return siblings;
        };

        function prepareField(lineLength, columnLength, percentageMines) {
            $(".mineCamp").empty();

            _lines = lineLength;
            _columns = columnLength;

            for (var l = 0; l < _lines; l++) {
                var line = $("<div/>");

                for (var c = 0; c < _columns; c++)
                    line.append(new Field(l, c));

                $(".mineCamp").append(line);
            }

            $(".playScreen").fadeOut('fast', function () {
                $(".mineCamp").fadeIn();
            });

            $(window).trigger("resize");
            generateMines(percentageMines);
        };
        function minesArround(field) {
            var siblings = fieldsSiblings(field);
            var mines = siblings.filter(function (f) { return $(f).data("mine"); }).length;
            if (mines) return mines;

            siblings.forEach(function (s) {
                if (!$(s).is(":disabled"))
                    $(s).trigger("mousedown");
            });
        };

        return {
            prepareField: prepareField,
            minesArround: minesArround
        };
    })();

    $(document).on('contextmenu', function () { return false; });

    $("#btnMineField").click(function () {
        gameEngine.prepareField($("#lines").val(), $("#columns").val());
    });

    $(window).resize(function () {
        var body = document.getElementsByTagName('body')[0],
            height = body.clientHeight,
            width = body.clientWidth,
            size = (height > width ? width : height) + "px";
        $(".mineCamp").css({ "width": size });
    });

    $(document).on("mousedown", ".field:not(.mineFound)", function (e) {
        if (e.button != 0 && !e.isTrigger)
            return;

        $(this).prop("disabled", true).removeClass("doubts");

        if ($(this).data("mine")) {
            $(this).addClass("mine").prop("disabled", true);
            $(".mineCamp").fadeOut('fast', function () {
                $(".playScreen").fadeIn();
            });
            return;
        }

        var minesArround = gameEngine.minesArround($(this));
        if (minesArround) $(this).addClass("has" + minesArround);
    }).on("contextmenu", ".field", function () {
        var field = $(this);
        switch (true) {
            case field.hasClass("mineFound"): field.removeClass("mineFound").addClass("doubts"); return;
            case field.hasClass("doubts"): field.removeClass("doubts").removeClass("mineFound doubts"); return;
            default: field.addClass("mineFound"); return;
        }
    });
});
