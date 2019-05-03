(function () {

    var UI_DEBUG = true;

    // Fades the sittable local entity over time
    var SITTABLE_START_ALPHA = 0.7;
    var SITTABLE_END_ALPHA = 0.075; // fades to this alpha value
    var SITTABLE_ALPHA_DELTA = 0.01;
    var SITTABLE_FADE_MS = 50; // "Click/Trigger to Sit" local entity image fade after 50 ms
    function startSittableLerpTransparency(sittableID, clearLerpIntervalCallback) {
        if (UI_DEBUG) {
            console.log("startSittableLerpTransparency");
        }

        var currentAlpha = SITTABLE_START_ALPHA;
        // Update the alpha value on the sittable overlay
        var intervalLerpTransparencyID = Script.setInterval(function () {

            currentAlpha = currentAlpha - SITTABLE_ALPHA_DELTA;
            Entities.editEntity(sittableID, { alpha: currentAlpha });

            if (currentAlpha <= SITTABLE_END_ALPHA) {
                // Stop fading and keep overlay at the minimum alpha
                clearLerpIntervalCallback();
            }
        }, SITTABLE_FADE_MS);

        return intervalLerpTransparencyID;
    }

    var _this = null;
    function SittableClickableUI() {
        _this = this;
        this.entityID = null;
        this.intervalLerpTransparencyID = null;
        this.sitEntityID = null;
    }

    SittableClickableUI.prototype = {
        preload: function (id) {
            _this.entityID = id;

            var properties = Entities.getEntityProperties(id);
            this.sitEntityID = properties.parentID;

            if (!_this.intervalLerpTransparencyID) {
                _this.intervalLerpTransparencyID = startSittableLerpTransparency(id, _this.clearLerpInterval);
            }
            this.displayModeChangedCallback = function () {
                if (_this && _this.entityID) {
                    Entities.editEntity(
                        _this.entityID,
                        { imageURL: HMD.active ? SITTABLE_IMAGE_URL_HMD : SITTABLE_IMAGE_URL_DESKTOP }
                    );
                }
            }
            HMD.displayModeChanged.connect(this.displayModeChangedCallback);
        },
        clearLerpInterval: function () {
            console.log("CLEAR LERP ALPHA");
            if (_this.intervalLerpTransparencyID) {
                console.log("CLEARING LERP ALPHA");
                Script.clearInterval(_this.intervalLerpTransparencyID);
                _this.intervalLerpTransparencyID = false;
            }
        },
        mouseReleaseOnEntity: function (entityID, event) {
            console.log("sit ui mouse release on entity");
            if (event.isPrimaryButton) {
                Entities.callEntityServerMethod(_this.sitEntityID, "onSitDown", [MyAvatar.sessionUUID]);
            }
        },
        unload: function () {
            _this.clearLerpInterval(); 
            HMD.displayModeChanged.disconnect(this.displayModeChangedCallback);
        }
    }

    return new SittableClickableUI();
});