document.addEventListener("DOMContentLoaded", () => {
    // =========================================================================
    // DATA & CONFIGURATION
    // 1. Define your subjects with unique colors
    // =========================================================================
    const subjects = {
        ML: { name: "Machine Learning", color: "#00e0ff" },
        JP: { name: "Java Programming", color: "#ffae00" },
        CN: { name: "Computer Networks", color: "#a855f7" },
        CD: { name: "Compiler Design", color: "#f755a8" },
        WT: { name: "Web Technology", color: "#84cc16" },
        PD: { name: "Personality Dev.", color: "#e34c26" },
        LIB: { name: "Library Hour", color: "#64748b" },
        SPORTS: { name: "Sports", color: "#16a34a" },
        WTTUT: { name: "Web Tech Tutorial", color: "#65a30d" }
    };

    // 2. Define your timetable using the subject keys from above
    const timetableData = {
        monday: [
            { time: "9:50 - 10:40", subjectKey: "ML", type: "Lecture" },
            { time: "10:40 - 11:30", subjectKey: "JP", type: "Lecture" },
            { time: "11:30 - 12:20", subjectKey: "CN", type: "Lecture" },
            { time: "12:20 - 1:10", subjectKey: "CD", type: "Lecture" },
            { time: "13:40 - 15:20", subjectKey: "JP", type: "Lab" } // Using 24-hour format for easier parsing
        ],
        tuesday: [
            { time: "9:50 - 10:40", subjectKey: "ML", type: "Lecture" },
            { time: "10:40 - 11:30", subjectKey: "JP", type: "Lecture" },
            { time: "11:30 - 13:10", subjectKey: "CN", type: "Lab" },
            { time: "13:40 - 14:30", subjectKey: "WT", type: "Lecture" },
            { time: "14:30 - 15:20", subjectKey: "CD", type: "Lecture" }
        ],
        wednesday: [
             { time: "9:50 - 10:40", subjectKey: "ML", type: "Lecture" },
             { time: "10:40 - 11:30", subjectKey: "LIB", type: "Self-Study" },
             { time: "11:30 - 12:20", subjectKey: "WT", type: "Lecture" },
             { time: "12:20 - 13:10", subjectKey: "CN", type: "Lecture" },
             { time: "13:40 - 15:20", subjectKey: "CD", type: "Lab" }
        ],
        thursday: [ /* Add your data */ ],
        friday: [ /* Add your data */ ],
        saturday: [ /* Add your data */ ],
        sunday: []
    };
    // =========================================================================

    const container = document.getElementById("timetable-container");
    const dayOrder = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

    // --- RENDER THE FULL TIMETABLE ---
    dayOrder.forEach(day => {
        const classes = timetableData[day];
        const panel = document.createElement("section");
        panel.className = "panel";
        panel.innerHTML = `<h2>${day.charAt(0).toUpperCase() + day.slice(1)}</h2>`;
        const list = document.createElement("div");
        list.className = "schedule-list";

        if (classes && classes.length > 0) {
            classes.forEach(item => {
                const subjectInfo = subjects[item.subjectKey];
                const card = document.createElement("div");
                card.className = "class-card";
                card.style.setProperty('--subject-color', subjectInfo.color);
                card.innerHTML = `
                    <h3>${subjectInfo.name}</h3>
                    <p>${item.time}</p>
                    <p><em>${item.type}</em></p>
                `;
                list.appendChild(card);
            });
        } else {
            list.innerHTML = `<div class="class-card" style="--subject-color: var(--text)"><h3>No Classes 🎉</h3></div>`;
        }
        panel.appendChild(list);
        container.appendChild(panel);
    });

    // --- SMART "UP NEXT" & LIVE STATUS LOGIC ---
    const bannerSubject = document.getElementById("upcoming-subject");
    const bannerTime = document.getElementById("upcoming-time");
    const bannerCountdown = document.getElementById("upcoming-countdown");
    let countdownInterval;

    function updateUpcomingStatus() {
        const now = new Date();
        const currentDayIndex = (now.getDay() + 6) % 7; // 0=Monday, 6=Sunday
        const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();
        
        let upcomingClass = null;
        let upcomingDay = "";
        let isLive = false;

        // Find the next class
        for (let i = 0; i < 7; i++) {
            const dayIndex = (currentDayIndex + i) % 7;
            const dayName = dayOrder[dayIndex];
            const daySchedule = timetableData[dayName];

            if (daySchedule && daySchedule.length > 0) {
                for (const item of daySchedule) {
                    const [startTimeStr] = item.time.split(' - ');
                    const [startHours, startMinutes] = startTimeStr.split(':').map(Number);
                    const startTime = startHours * 60 + startMinutes;
                    
                    // If we are looking at today's schedule, check if the class is in the future
                    if (i === 0 && startTime > currentTimeInMinutes) {
                        upcomingClass = item;
                        upcomingDay = dayName;
                        break;
                    }
                    // If we are looking at a future day, the first class is the upcoming one
                    if (i > 0) {
                        upcomingClass = item;
                        upcomingDay = dayName;
                        break;
                    }
                }
            }
            if (upcomingClass) break;
        }

        // Update banner and start countdown
        if (upcomingClass) {
            const subjectInfo = subjects[upcomingClass.subjectKey];
            bannerSubject.textContent = subjectInfo.name;
            bannerTime.textContent = `${upcomingDay.charAt(0).toUpperCase() + upcomingDay.slice(1)} at ${upcomingClass.time.split(' - ')[0]}`;
            
            // Countdown logic
            clearInterval(countdownInterval);
            countdownInterval = setInterval(() => {
                const now2 = new Date();
                const [startHours, startMinutes] = upcomingClass.time.split(' - ')[0].split(':').map(Number);
                
                let nextClassDate = new Date();
                const dayDiff = (dayOrder.indexOf(upcomingDay) - currentDayIndex + 7) % 7;
                nextClassDate.setDate(now2.getDate() + dayDiff);
                nextClassDate.setHours(startHours, startMinutes, 0, 0);

                const diff = nextClassDate - now2;
                if (diff > 0) {
                    const h = Math.floor(diff / 1000 / 60 / 60);
                    const m = Math.floor(diff / 1000 / 60) % 60;
                    const s = Math.floor(diff / 1000) % 60;
                    bannerCountdown.textContent = `in ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
                } else {
                    bannerCountdown.textContent = "Starting now...";
                }
            }, 1000);

        } else {
            bannerSubject.textContent = "Enjoy your break!";
            bannerTime.textContent = "No upcoming classes found.";
        }
    }

    // --- ANIMATIONS ---
    gsap.from(".panel h2", {
        scrollTrigger: {
            trigger: ".panel h2",
            start: "top 90%",
            toggleActions: "play none none none"
        },
        y: 50,
        opacity: 0,
        duration: 1
    });

    gsap.from(".schedule-list", {
        scrollTrigger: {
            trigger: ".schedule-list",
            start: "top 85%",
            toggleActions: "play none none none"
        },
        x: -100,
        opacity: 0,
        duration: 1
    });

    // Run everything
    updateUpcomingStatus();
    setInterval(updateUpcomingStatus, 60000); // Re-check for the next class every minute
});