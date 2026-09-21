/* ==========================================
   SizeSnap — Image Compression Engine
   ========================================== */

"use strict";


// ------------------------------------------
// Elements
// ------------------------------------------

const fileInput = document.getElementById("fileInput");
const chooseFileBtn = document.getElementById("chooseFileBtn");
const dropZone = document.getElementById("dropZone");

const uploadScreen = document.getElementById("uploadScreen");
const sizeScreen = document.getElementById("sizeScreen");
const processingScreen = document.getElementById("processingScreen");
const resultScreen = document.getElementById("resultScreen");

const imagePreview = document.getElementById("imagePreview");
const resultImage = document.getElementById("resultImage");

const fileName = document.getElementById("fileName");
const originalSize = document.getElementById("originalSize");

const targetSizeInput = document.getElementById("targetSize");
const sizeUnit = document.getElementById("sizeUnit");

const compressBtn = document.getElementById("compressBtn");
const backToUpload = document.getElementById("backToUpload");
const compressAnotherBtn = document.getElementById("compressAnotherBtn");

const downloadBtn = document.getElementById("downloadBtn");

const resultOriginalSize =
    document.getElementById("resultOriginalSize");

const resultNewSize =
    document.getElementById("resultNewSize");

const savedPercentage =
    document.getElementById("savedPercentage");

const errorMessage =
    document.getElementById("errorMessage");

const steps = document.querySelectorAll(".step");
const quickSizeButtons =
    document.querySelectorAll(".quick-size");


// ------------------------------------------
// State
// ------------------------------------------

let selectedFile = null;
let selectedImage = null;

let originalObjectURL = null;
let resultObjectURL = null;


// ------------------------------------------
// Constants
// ------------------------------------------

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

const MIN_TARGET_BYTES = 10 * 1024; // 10 KB

const MAX_COMPRESSION_WIDTH = 6000;
const MAX_COMPRESSION_HEIGHT = 6000;


// ------------------------------------------
// Utility: Show screen
// ------------------------------------------

function showScreen(screen) {

    const screens = [
        uploadScreen,
        sizeScreen,
        processingScreen,
        resultScreen
    ];

    screens.forEach(item => {
        item.classList.remove("active-screen");
    });

    screen.classList.add("active-screen");

    hideError();
}


// ------------------------------------------
// Utility: Update steps
// ------------------------------------------

function updateSteps(currentStep) {

    steps.forEach((step, index) => {

        const number = index + 1;

        step.classList.remove(
            "active",
            "completed"
        );

        if (number < currentStep) {
            step.classList.add("completed");
        }

        if (number === currentStep) {
            step.classList.add("active");
        }
    });
}


// ------------------------------------------
// Error handling
// ------------------------------------------

function showError(message) {

    errorMessage.textContent = message;
    errorMessage.classList.add("show");
}

function hideError() {

    errorMessage.textContent = "";
    errorMessage.classList.remove("show");
}


// ------------------------------------------
// File size formatter
// ------------------------------------------

function formatBytes(bytes) {

    if (!Number.isFinite(bytes) || bytes <= 0) {
        return "0 KB";
    }

    const units = [
        "Bytes",
        "KB",
        "MB",
        "GB"
    ];

    const index = Math.floor(
        Math.log(bytes) / Math.log(1024)
    );

    const safeIndex = Math.min(
        index,
        units.length - 1
    );

    const value =
        bytes / Math.pow(1024, safeIndex);

    if (safeIndex === 0) {
        return `${Math.round(value)} ${units[safeIndex]}`;
    }

    return `${value.toFixed(value >= 10 ? 1 : 2)} ${units[safeIndex]}`;
}


// ------------------------------------------
// Convert target size to bytes
// ------------------------------------------

function getTargetBytes() {

    const value = Number(
        targetSizeInput.value
    );

    const unit = sizeUnit.value;

    if (!Number.isFinite(value) || value <= 0) {
        return null;
    }

    if (unit === "MB") {
        return Math.round(
            value * 1024 * 1024
        );
    }

    return Math.round(
        value * 1024
    );
}


// ------------------------------------------
// Validate file
// ------------------------------------------

function isValidImage(file) {

    if (!file) {
        return false;
    }

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    return allowedTypes.includes(
        file.type
    );
}


// ------------------------------------------
// Handle selected file
// ------------------------------------------

function handleFile(file) {

    hideError();

    if (!file) {
        return;
    }

    if (!isValidImage(file)) {

        showError(
            "Please choose a JPG, PNG or WebP image."
        );

        return;
    }

    if (file.size > MAX_FILE_SIZE) {

        showError(
            "This image is larger than 20 MB. Please choose a smaller image."
        );

        return;
    }

    selectedFile = file;

    if (originalObjectURL) {
        URL.revokeObjectURL(
            originalObjectURL
        );
    }

    originalObjectURL =
        URL.createObjectURL(file);

    imagePreview.src =
        originalObjectURL;

    fileName.textContent =
        file.name;

    originalSize.textContent =
        formatBytes(file.size);

    loadImage(file)
        .then(image => {

            selectedImage = image;

            showScreen(sizeScreen);
            updateSteps(2);

        })
        .catch(() => {

            showError(
                "We couldn't read this image. Please try another file."
            );

        });
}


// ------------------------------------------
// Load image
// ------------------------------------------

function loadImage(file) {

    return new Promise(
        (resolve, reject) => {

            const img = new Image();

            const url =
                URL.createObjectURL(file);

            img.onload = () => {

                URL.revokeObjectURL(url);

                resolve(img);
            };

            img.onerror = () => {

                URL.revokeObjectURL(url);

                reject(
                    new Error("Image loading failed")
                );
            };

            img.src = url;
        }
    );
}


// ------------------------------------------
// Open file picker
// ------------------------------------------

chooseFileBtn.addEventListener(
    "click",
    event => {

        event.stopPropagation();

        fileInput.click();
    }
);


dropZone.addEventListener(
    "click",
    event => {

        if (
            event.target.closest(
                "#chooseFileBtn"
            )
        ) {
            return;
        }

        fileInput.click();
    }
);


fileInput.addEventListener(
    "change",
    event => {

        const file =
            event.target.files[0];

        handleFile(file);
    }
);


// ------------------------------------------
// Drag & Drop
// ------------------------------------------

[
    "dragenter",
    "dragover"
].forEach(eventName => {

    dropZone.addEventListener(
        eventName,
        event => {

            event.preventDefault();

            dropZone.classList.add(
                "dragging"
            );
        }
    );
});


[
    "dragleave",
    "drop"
].forEach(eventName => {

    dropZone.addEventListener(
        eventName,
        event => {

            event.preventDefault();

            dropZone.classList.remove(
                "dragging"
            );
        }
    );
});


dropZone.addEventListener(
    "drop",
    event => {

        const file =
            event.dataTransfer.files[0];

        handleFile(file);
    }
);


// ------------------------------------------
// Keyboard support
// ------------------------------------------

dropZone.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Enter" ||
            event.key === " "
        ) {

            event.preventDefault();

            fileInput.click();
        }
    }
);


// ------------------------------------------
// Quick size buttons
// ------------------------------------------

quickSizeButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            quickSizeButtons.forEach(
                item => {
                    item.classList.remove(
                        "selected"
                    );
                }
            );

            button.classList.add(
                "selected"
            );

            targetSizeInput.value =
                button.dataset.size;

            sizeUnit.value =
                button.dataset.unit;
        }
    );
});


// ------------------------------------------
// Clear quick selection when typing
// ------------------------------------------

targetSizeInput.addEventListener(
    "input",
    () => {

        quickSizeButtons.forEach(
            button => {
                button.classList.remove(
                    "selected"
                );
            }
        );
    }
);

sizeUnit.addEventListener(
    "change",
    () => {

        quickSizeButtons.forEach(
            button => {
                button.classList.remove(
                    "selected"
                );
            }
        );
    }
);


// ------------------------------------------
// Back button
// ------------------------------------------

backToUpload.addEventListener(
    "click",
    () => {

        resetApplication();

        showScreen(uploadScreen);
        updateSteps(1);
    }
);


// ------------------------------------------
// Compression
// ------------------------------------------

compressBtn.addEventListener(
    "click",
    async () => {

        hideError();

        if (!selectedFile || !selectedImage) {

            showError(
                "Please choose an image first."
            );

            return;
        }

        const targetBytes =
            getTargetBytes();

        if (!targetBytes) {

            showError(
                "Please enter a valid target size."
            );

            return;
        }

        if (
            targetBytes <
            MIN_TARGET_BYTES
        ) {

            showError(
                "Please choose a target size of at least 10 KB."
            );

            return;
        }

        if (
            targetBytes >=
            selectedFile.size
        ) {

            showError(
                "The target size is already larger than or equal to your original image."
            );

            return;
        }

        showScreen(processingScreen);
        updateSteps(2);

        await wait(80);

        try {

            const result =
                await compressToTarget(
                    selectedImage,
                    targetBytes
                );

            if (!result) {

                throw new Error(
                    "Compression failed"
                );
            }

            showResult(
                result
            );

        } catch (error) {

            console.error(error);

            showScreen(sizeScreen);

            showError(
                "We couldn't compress this image to that size. Try a slightly larger target."
            );
        }
    }
);


// ------------------------------------------
// Main compression function
// ------------------------------------------

async function compressToTarget(
    image,
    targetBytes
) {

    let width = image.naturalWidth;
    let height = image.naturalHeight;


    // Prevent extremely large canvas sizes
    if (
        width > MAX_COMPRESSION_WIDTH ||
        height > MAX_COMPRESSION_HEIGHT
    ) {

        const scale =
            Math.min(
                MAX_COMPRESSION_WIDTH / width,
                MAX_COMPRESSION_HEIGHT / height
            );

        width = Math.floor(width * scale);
        height = Math.floor(height * scale);
    }


    let bestResult = null;


    // We primarily use JPEG because
    // it gives us predictable quality control.
    //
    // PNG/WebP input is converted into
    // JPEG output for stronger compression.

    for (
        let dimensionPass = 0;
        dimensionPass < 8;
        dimensionPass++
    ) {

        const result =
            await findBestQuality(
                image,
                width,
                height,
                targetBytes
            );

        if (result) {

            bestResult = result;

            if (
                result.blob.size <=
                targetBytes
            ) {
                break;
            }
        }


        // If quality alone isn't enough,
        // reduce dimensions gradually.

        width =
            Math.max(
                320,
                Math.floor(width * 0.85)
            );

        height =
            Math.max(
                320,
                Math.floor(height * 0.85)
            );

        await wait(0);
    }


    if (!bestResult) {
        return null;
    }

    return bestResult;
}


// ------------------------------------------
// Find best JPEG quality
// ------------------------------------------

async function findBestQuality(
    image,
    width,
    height,
    targetBytes
) {

    let low = 0.05;
    let high = 0.95;

    let bestBlob = null;
    let bestQuality = 0;


    // First check highest quality.
    const highBlob =
        await canvasToBlob(
            image,
            width,
            height,
            high
        );

    if (highBlob.size <= targetBytes) {

        return {
            blob: highBlob,
            width,
            height,
            quality: high
        };
    }


    // Binary search for suitable quality.

    for (
        let i = 0;
        i < 10;
        i++
    ) {

        const quality =
            (low + high) / 2;

        const blob =
            await canvasToBlob(
                image,
                width,
                height,
                quality
            );

        if (
            blob.size <=
            targetBytes
        ) {

            bestBlob = blob;
            bestQuality = quality;

            low = quality;

        } else {

            high = quality;
        }

        await wait(0);
    }


    if (!bestBlob) {

        const minimumBlob =
            await canvasToBlob(
                image,
                width,
                height,
                0.05
            );

        if (
            minimumBlob.size <=
            targetBytes
        ) {

            return {
                blob: minimumBlob,
                width,
                height,
                quality: 0.05
            };
        }

        return null;
    }


    return {
        blob: bestBlob,
        width,
        height,
        quality: bestQuality
    };
}


// ------------------------------------------
// Canvas → JPEG Blob
// ------------------------------------------

function canvasToBlob(
    image,
    width,
    height,
    quality
) {

    return new Promise(
        resolve => {

            const canvas =
                document.createElement(
                    "canvas"
                );

            canvas.width = width;
            canvas.height = height;

            const ctx =
                canvas.getContext(
                    "2d",
                    {
                        alpha: false
                    }
                );

            ctx.imageSmoothingEnabled =
                true;

            ctx.imageSmoothingQuality =
                "high";


            // White background prevents
            // transparent PNG areas from
            // becoming black in JPEG.

            ctx.fillStyle = "#ffffff";

            ctx.fillRect(
                0,
                0,
                width,
                height
            );


            ctx.drawImage(
                image,
                0,
                0,
                width,
                height
            );


            canvas.toBlob(
                blob => {

                    resolve(blob);

                },
                "image/jpeg",
                quality
            );
        }
    );
}


// ------------------------------------------
// Show result
// ------------------------------------------

function showResult(result) {

    if (resultObjectURL) {

        URL.revokeObjectURL(
            resultObjectURL
        );
    }

    resultObjectURL =
        URL.createObjectURL(
            result.blob
        );

    resultImage.src =
        resultObjectURL;


    resultOriginalSize.textContent =
        formatBytes(
            selectedFile.size
        );

    resultNewSize.textContent =
        formatBytes(
            result.blob.size
        );


    const saved =
        Math.max(
            0,
            (
                1 -
                result.blob.size /
                selectedFile.size
            ) * 100
        );

    savedPercentage.textContent =
        `${saved.toFixed(1)}%`;


    const originalName =
        selectedFile.name
            .replace(/\.[^/.]+$/, "");


    downloadBtn.href =
        resultObjectURL;

    downloadBtn.download =
        `${originalName}-compressed.jpg`;


    showScreen(resultScreen);
    updateSteps(3);
}


// ------------------------------------------
// Compress another
// ------------------------------------------

compressAnotherBtn.addEventListener(
    "click",
    () => {

        resetApplication();

        showScreen(uploadScreen);
        updateSteps(1);
    }
);


// ------------------------------------------
// Reset
// ------------------------------------------

function resetApplication() {

    selectedFile = null;
    selectedImage = null;


    if (originalObjectURL) {

        URL.revokeObjectURL(
            originalObjectURL
        );

        originalObjectURL = null;
    }


    if (resultObjectURL) {

        URL.revokeObjectURL(
            resultObjectURL
        );

        resultObjectURL = null;
    }


    fileInput.value = "";

    targetSizeInput.value = "";

    sizeUnit.value = "KB";


    imagePreview.removeAttribute(
        "src"
    );

    resultImage.removeAttribute(
        "src"
    );


    quickSizeButtons.forEach(
        button => {

            button.classList.remove(
                "selected"
            );
        }
    );


    hideError();
}


// ------------------------------------------
// Small async helper
// ------------------------------------------

function wait(milliseconds) {

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                milliseconds
            )
    );
}


// ------------------------------------------
// Cleanup on page close
// ------------------------------------------

window.addEventListener(
    "beforeunload",
    () => {

        if (originalObjectURL) {
            URL.revokeObjectURL(
                originalObjectURL
            );
        }

        if (resultObjectURL) {
            URL.revokeObjectURL(
                resultObjectURL
            );
        }
    }
);


// ------------------------------------------
// Initial state
// ------------------------------------------

showScreen(uploadScreen);
updateSteps(1);
