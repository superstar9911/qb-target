document.addEventListener("DOMContentLoaded", function () {
    const targetEye = document.getElementById("target-eye");
    const targetLabel = document.getElementById("target-label");

    function OpenTarget() {
        targetLabel.textContent = "";
        targetEye.style.display = "block";
        targetEye.classList.remove("target-success", "crosshair");
    }

    function CloseTarget() {
        targetLabel.textContent = "";
        targetEye.style.display = "none";
    }

    function createTargetOption(index, itemData) {
        if (itemData !== null) {
            index = Number(index) + 1;
            const targetOption = document.createElement("div");
            targetOption.id = `target-option-${index}`;

            // Add label text
            const targetIcon = document.createElement("span");
            targetIcon.id = `target-icon-${index}`;

            // Optional: keep icon if provided in itemData
            if (itemData.icon) {
                const icon = document.createElement("i");
                icon.className = itemData.icon;
                targetIcon.appendChild(icon);
                targetIcon.appendChild(document.createTextNode(" "));
            }

            targetOption.appendChild(targetIcon);
            targetOption.appendChild(document.createTextNode(itemData.label));
            targetLabel.appendChild(targetOption);
        }
    }

    function FoundTarget(item) {
        // Toggle crosshair if specified
        if (item.useCrosshair) {
            targetEye.classList.add("crosshair");
        } else {
            targetEye.classList.remove("crosshair");
        }

        // Add success class if desired
        if (item.isSuccess) {
            targetEye.classList.add("target-success");
        } else {
            targetEye.classList.remove("target-success");
        }

        targetLabel.textContent = "";
        for (let [index, itemData] of Object.entries(item.options)) {
            createTargetOption(index, itemData);
        }
    }

    function ValidTarget(item) {
        targetLabel.textContent = "";
        for (let [index, itemData] of Object.entries(item.data)) {
            createTargetOption(index, itemData);
        }
    }

    function LeftTarget() {
        targetLabel.textContent = "";
        targetEye.classList.remove("target-success", "crosshair");
    }

    function handleMouseDown(event) {
        const element = event.target;
        if (element.id) {
            const split = element.id.split("-");
            if (split[0] === "target" && split[1] !== "eye" && event.button === 0) {
                fetch(`https://${GetParentResourceName()}/selectTarget`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json; charset=UTF-8" },
                    body: JSON.stringify(split[2]),
                }).catch((error) => console.error("Error:", error));
                targetLabel.textContent = "";
            }
        }

        if (event.button === 2) {
            LeftTarget();
            fetch(`https://${GetParentResourceName()}/leftTarget`, {
                method: "POST",
                headers: { "Content-Type": "application/json; charset=UTF-8" },
                body: "",
            }).catch((error) => console.error("Error:", error));
        }
    }

    function handleKeyDown(event) {
        if (event.key === "Escape" || event.key === "Backspace") {
            CloseTarget();
            fetch(`https://${GetParentResourceName()}/closeTarget`, {
                method: "POST",
                headers: { "Content-Type": "application/json; charset=UTF-8" },
                body: "",
            }).catch((error) => console.error("Error:", error));
        }
    }

    // Handle events from client/server
    window.addEventListener("message", function (event) {
        switch (event.data.response) {
            case "openTarget":
                OpenTarget();
                break;
            case "closeTarget":
                CloseTarget();
                break;
            case "foundTarget":
                FoundTarget(event.data);
                break;
            case "validTarget":
                ValidTarget(event.data);
                break;
            case "leftTarget":
                LeftTarget();
                break;
        }
    });

    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("keydown", handleKeyDown);

    window.addEventListener("unload", function () {
        window.removeEventListener("mousedown", handleMouseDown);
        window.removeEventListener("keydown", handleKeyDown);
    });
});
