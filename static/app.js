Dropzone.autoDiscover = false;

function init() {
    let dz = new Dropzone("#dropzone", {
        url: "/classify_image",
        maxFiles: 1,
        addRemoveLinks: true,
        autoProcessQueue: false
    });

    dz.on("addedfile", function() {
        if (dz.files[1] != null) dz.removeFile(dz.files[0]);
    });

    dz.on("complete", function(file) {
        let imageData = file.dataURL;

        $.post("/classify_image", { image_data: imageData })
            .done(function(data) {
                if (!data || data.length === 0 || data[0].error) {
                    $("#error").show();
                    $("#error p").text(data[0] ? data[0].error : "Unknown error");
                    $("#resultHolder").hide();
                    $("#classTable").hide();
                    return;
                }

                let match = null, bestScore = -1;
                for (let i = 0; i < data.length; i++) {
                    let maxScore = Math.max(...data[i].class_probability);
                    if (maxScore > bestScore) {
                        match = data[i];
                        bestScore = maxScore;
                    }
                }

                if (match) {
                    $("#error").hide();
                    $("#resultHolder").show().html(`
                        <img src="${$(`[data-player="${match.class}"] img`).attr('src')}" alt="${match.class}">
                        <h5>${match.class.charAt(0).toUpperCase() + match.class.slice(1)}</h5>
                    `);
                    $("#classTable").show();

                    let classDict = match.class_dictionary;
                    for (let name in classDict) {
                        let idx = classDict[name];
                        let score = match.class_probability[idx];
                        $(`#score_${name}`).html(score.toFixed(2));
                    }
                }
            })
            .fail(function(xhr) {
                let errMsg = xhr.responseJSON && xhr.responseJSON.error ? xhr.responseJSON.error : "Unknown error";
                $("#error").show();
                $("#error p").text(errMsg);
                $("#resultHolder").hide();
                $("#classTable").hide();
            });
    });

    $("#submitBtn").on("click", function () {
        dz.processQueue();
    });
}

$(document).ready(function() {
    $("#error").hide();
    $("#resultHolder").hide();
    $("#classTable").hide();
    init();
});
