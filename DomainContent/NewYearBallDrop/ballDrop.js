//
// ballDrop.js
// 
// Created by Rebecca Stankus on 12/06/2018
// Copyright High Fidelity 2018
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//

(function () {
    var _this;

    var TIME_CHECK_INTERVAL_MS = 50;
    var FIREWORK_INTERVAL = 1000;
    var ONE_THOUSAND = 1000;
    var SECONDS_PER_MINUTE = 60;
    var MINUTES_PER_HOUR = 60;
    var TWO_DIGITS = 10;
    var TARGET_TIME_INDEX = 13;
    var BALL_START_POSITION = { x: -29.8177, y: 6.8299, z: -108.6157 };
    var INTERVAL_DROP_DISTANCE_M = 0.0090;
    var MUSIC = SoundCache.getSound(Script.resolvePath("assets/audio/auldJimi.mp3"));
    var EXPLOSION = SoundCache.getSound(Script.resolvePath("assets/audio/explosion.mp3"));
    var FIREWORK = SoundCache.getSound(Script.resolvePath("assets/audio/firework.mp3"));
    var TICK = SoundCache.getSound(Script.resolvePath("assets/audio/tick.wav"));
    var TOCK = SoundCache.getSound(Script.resolvePath("assets/audio/tock.wav"));
    var HOURS_PER_DAY = 24;
    var MAX_NUMBER_OF_DROPS = 27;

    var injector;
    var ballDropInterval;
    var currentPosition = { x: -29.8177, y: 6.8299, z: -108.6157 };
    var confetti;
    var ball = "{6414271b-f0f4-4a62-b196-ac83dfd95253}";
    var innerBall = "{42910458-c9e3-4a83-93d4-f5732b6a516e}";
    var ballParticle = "{9d774699-e4f7-4de5-a264-d6ed212eec5f}";
    var cityListText = "{80823bd4-5bd7-410d-8e3e-c3d019760a8f}";
    var fireworks = ["{8eaf6f0a-9410-4929-9294-2956cb80c08c}", "{f8e6b4cc-20b4-4316-a2c3-4d29b25f6380}",
        "{d9e7b29b-16d7-4dfa-8f3d-45afbbd50eb6}", "{5f05aeb7-14cf-424e-8c4c-8c04f5719548}"];
    var targetName;
    var targetDate;
    var targetTime;
    var target5Minutes;
    var targetHour;
    var targetDay;
    var targetMonth = "Dec";
    var targetYear;
    var numberOfDrops = 0;
    var currentCities;
    var lastSecond;
    var tick = true;
    var cities = ["Samoa and Christmas Island", "Auckland, Suva, Wellington", 
        "Anadyr, Tarawa, Majuro", "Melbourne, Sydney, Honiara",
        "Brisbane, Port Moresby", "Tokyo, Seoul, Pyongyang",
        "Beijing, Manila, Singapore", "Jakarta, Bangkok, Hanoi",
        "Dhaka, Thimphu, Astana", "Tashkent, Islamabad, Karachi",
        "Dubai, Abu Dhabi, Muscat", "Moscow, Baghdad, Nairobi",
        "Cairo, Bucharest, Johannesburg", "Brussels, Paris, Rome, Lagos",
        "London, Lisbon, Accra, Reykjavik", "Praia, Ponta Delgada",
        "Rio de Janeiro, São Paulo", "Buenos Aires, Santiago, Asuncion",
        "Caracas, La Paz, San Juan", "New York, Detroit, Havana",
        "Mexico City, Chicago, Winnipeg", "Calgary, Denver, Phoenix",
        "Seattle, San Francisco, Las Vegas", "Anchorage, Fairbanks, Unalaska",
        "Honolulu, Rarotonga, Papeete", "Alofi, Midway, Pago Pago", 
        "Baker Island, Howland Island"];

    var Countdown = function() {
        _this = this;
    };

    Countdown.prototype = {
        interval: null,
        targetTime: null,

        preload: function(entityID) {
            Entities.editEntity(ball, {
                position: BALL_START_POSITION,
                animation: { hold: true, currentFrame: 1 }
            });
            Entities.editEntity(innerBall, { position: BALL_START_POSITION });
            Entities.editEntity(cityListText, { text: "" });
            _this.entityID = entityID;
            _this.getTargetTime();
            _this.startSyncing();
            Entities.getChildrenIDs(_this.entityID).forEach(function(child) {
                var name = Entities.getEntityProperties(child, 'name').name;
                if (name === "New Year's Confetti") {
                    confetti = child;
                }
            });
            Entities.editEntity(ballParticle, { isEmitting: false });
            Entities.editEntity(confetti, { isEmitting: false });
        },

        startSyncing: function() {
            currentPosition = { x: -29.8177, y: 6.8299, z: -108.6157 };
            _this.interval = Script.setInterval(function() {
                _this.synchronize();
            }, TIME_CHECK_INTERVAL_MS);
        },

        getTargetTime: function() {
            targetName = Entities.getEntityProperties(_this.entityID, 'name').name;
            targetDate = new Date(targetName.substring(TARGET_TIME_INDEX, (targetName.length)));
            targetTime = targetDate.getTime();
            targetYear = targetDate.getFullYear();
            targetDay = targetDate.getDate();
            targetHour = targetDate.getHours();
            target5Minutes = targetDate.getMinutes();
        },

        synchronize: function() {
            var currentTime = Date.getNow();
            var untilTargetTime = targetTime - currentTime;
            var targetPassed = false;
            var hours = Math.floor((untilTargetTime % (ONE_THOUSAND * SECONDS_PER_MINUTE * MINUTES_PER_HOUR * HOURS_PER_DAY))
                 / (ONE_THOUSAND * SECONDS_PER_MINUTE * MINUTES_PER_HOUR ));
            if (hours > 0) {
                Entities.editEntity(_this.entityID, { text: "--:--" });
                return;
            } else {
                if (!Entities.getEntityProperties(cityListText, 'text').text) {
                    currentCities = 0;
                    Entities.editEntity(cityListText, { text: cities[currentCities] });
                }
            }
            var minutes = Math.floor((untilTargetTime % (ONE_THOUSAND * SECONDS_PER_MINUTE * MINUTES_PER_HOUR )) /
                (ONE_THOUSAND * SECONDS_PER_MINUTE));
            var seconds = Math.floor((untilTargetTime % (ONE_THOUSAND * SECONDS_PER_MINUTE)) / ONE_THOUSAND);
            if (minutes < 1) {
                currentPosition.y -= INTERVAL_DROP_DISTANCE_M;
                Entities.editEntity(ball, { position: currentPosition });
                Entities.editEntity(innerBall, { position: currentPosition });
                if (seconds < 1) {
                    targetPassed = true;
                }
            }
            minutes = minutes < TWO_DIGITS ? "0" + minutes : minutes;
            seconds = seconds < TWO_DIGITS ? "0" + seconds : seconds;
            if (targetPassed) {
                Entities.editEntity(_this.entityID, { text: "2019!" });
                _this.timeUp();
            } else {
                if (lastSecond !== seconds) {
                    if (minutes < 1 && hours < 1) {
                        lastSecond = seconds;
                        if (tick) {
                            _this.playSound(TICK, Entities.getEntityProperties( cityListText, 'position').position);
                            tick = false;
                        } else {
                            _this.playSound(TOCK, Entities.getEntityProperties( cityListText, 'position').position);
                            tick = true;
                        }
                    }
                    Entities.editEntity(_this.entityID, { text: minutes + ":" + seconds });
                }  
            }
        },

        timeUp: function() {
            _this.playSound(EXPLOSION, currentPosition);
            numberOfDrops++;
            Script.clearInterval(_this.interval);
            _this.interval = Script.setInterval(function() {
                var msToExplode = Math.random() * 1000;
                var currentFirework = Math.floor(Math.random() * 4);
                var newX = (Math.random() * 60) + (BALL_START_POSITION.x - 30);
                var newY = (Math.random() * 20) + (BALL_START_POSITION.y + 5);
                var newZ = (Math.random() * 60) + (BALL_START_POSITION.z - 30);
                var newPosition = { x: newX, y: newY, z: newZ };
                Script.setTimeout(function() {
                    Entities.editEntity(fireworks[currentFirework], { 
                        position: newPosition,
                        isEmitting: true
                    });
                    _this.playSound(FIREWORK, Entities.getEntityProperties( newPosition, 'position').position);
                    Script.setTimeout(function() {
                        Entities.editEntity(fireworks[currentFirework], { isEmitting: false });
                    }, ONE_THOUSAND);
                }, msToExplode);
            }, FIREWORK_INTERVAL);
            Entities.editEntity(ballParticle, { isEmitting: true });
            Entities.editEntity(ball, { animation: { hold: false }});
            currentPosition = BALL_START_POSITION;
            _this.playSound(MUSIC, currentPosition);
            Entities.editEntity(confetti, { isEmitting: true });
            Script.setTimeout(function() {
                Script.clearInterval(_this.interval);
                Entities.editEntity(ball, {
                    position: BALL_START_POSITION,
                    animation: { hold: true, currentFrame: 1 }
                });
                Entities.editEntity(innerBall, { position: BALL_START_POSITION});
                Entities.editEntity(_this.entityID, { text: "DONE!" });
                Entities.editEntity(confetti, { isEmitting: false });
                Script.setTimeout(function() {
                    Entities.editEntity(ballParticle, { isEmitting: false });
                    if (numberOfDrops === MAX_NUMBER_OF_DROPS) {
                        Entities.editEntity(cityListText, { text: "HAPPY NEW YEAR EVERYONE!" });
                    } else {
                        target5Minutes += 5;
                        if (target5Minutes > 59) {
                            target5Minutes -= 60;
                            targetHour++;
                            if (targetHour > 23) {
                                targetHour -= 24;
                                targetDay++;
                                if (targetDay > 30) {
                                    targetDay-= 31;
                                    targetMonth = "Jan";
                                    targetYear = 2019;
                                }
                            }
                        }
                        targetTime = new Date(targetMonth + " " + targetDay + ", " + targetYear + " " + targetHour + ":" +
                        target5Minutes + ":00").getTime();
                        currentCities++;
                        Entities.editEntity(cityListText, { text: cities[currentCities] });
                        _this.startSyncing();
                    }
                }, 500);
            }, MUSIC.duration * 1000);
        },

        playSound: function(sound, position) {
            if (sound.downloaded) {
                injector = Audio.playSound(sound, {
                    position: Entities.getEntityProperties(ball, 'position').position,
                    volume: 1
                });
            }
        },

        unload: function() {
            if (injector) {
                injector.stop();
            }
            if (_this.interval) {
                Script.clearInterval(_this.interval);
            }
            if (ballDropInterval) {
                Script.clearInterval(ballDropInterval);
            }
        }

    };

    return new Countdown;
});
