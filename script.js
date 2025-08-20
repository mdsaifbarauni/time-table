document.addEventListener("DOMContentLoaded", () => {
    // =========================================================================
    // DATA & CONFIGURATION
    // =========================================================================
    const subjects = {
        ML: { name: "Machine Learning(VR)", color: "#00e0ff" },
        JP: { name: "Java Programming(GK)", color: "#ffae00" },
        CN: { name: "Computer Networks(RKS", color: "#a855f7" },
        CD: { name: "Compiler Design(VR)", color: "#f755a8" },
        WT: { name: "Web Technology(RKS)", color: "#84cc16" },
        PD: { name: "Personality Dev(YD).", color: "#e34c26" },
        LIB: { name: "Library Hour", color: "#64748b" },
        SPORTS: { name: "Sports(RKS", color: "#16a34a" },
        WTTUT: { name: "Web Tech Tutorial(RKS)", color: "#65a30d" },
        NPTEL: { name: "NPTEL Course", color: "#ff6347"}
    };

    const timetableData = {
        monday: [{ time: "9:50 - 10:40", subjectKey: "ML", type: "Lecture" }, { time: "10:40 - 11:30", subjectKey: "JP", type: "Lecture" }, { time: "11:30 - 12:20", subjectKey: "CN", type: "Lecture" }, { time: "12:20 - 13:10", subjectKey: "CD", type: "Lecture" }, { time: "13:40 - 15:20", subjectKey: "JP", type: "Lab" }],
        tuesday: [{ time: "9:50 - 10:40", subjectKey: "ML", type: "Lecture" }, { time: "10:40 - 11:30", subjectKey: "JP", type: "Lecture" }, { time: "11:30 - 13:10", subjectKey: "CN", type: "Lab" }, { time: "13:40 - 14:30", subjectKey: "WT", type: "Lecture" }, { time: "14:30 - 15:20", subjectKey: "CD", type: "Lecture" }],
        wednesday: [{ time: "9:50 - 10:40", subjectKey: "ML", type: "Lecture" }, { time: "10:40 - 11:30", subjectKey: "LIB", type: "Self-Study" }, { time: "11:30 - 12:20", subjectKey: "WT", type: "Lecture" }, { time: "12:20 - 13:10", subjectKey: "CN", type: "Lecture" }, { time: "13:40 - 15:20", subjectKey: "CD", type: "Lab" }],
        thursday: [{ time: "9:50 - 10:40", subjectKey: "ML", type: "Lecture" }, { time: "10:40 - 11:30", subjectKey: "JP", type: "Lecture" }, { time: "11:30 - 12:20", subjectKey: "CN", type: "Lecture" }, { time: "12:20 - 13:10", subjectKey: "CD", type: "Lecture" }, { time: "13:40 - 15:20", subjectKey: "SPORTS", type: "Activity" }],
        friday: [{ time: "9:50 - 11:30", subjectKey: "JP", type: "Lab" }, { time: "11:30 - 12:20", subjectKey: "CN", type: "Lecture" }, { time: "12:20 - 13:10", subjectKey: "PD", type: "Class" }, { time: "13:40 - 14:30", subjectKey: "WT", type: "Lecture" }, { time: "14:30 - 15:20", subjectKey: "JP", type: "Lecture" }],
        saturday: [{ time: "9:50 - 10:40", subjectKey: "CD", type: "Tutorial" }, { time: "10:40 - 11:30", subjectKey: "WT", type: "Tutorial" }, { time: "11:30 - 12:20", subjectKey: "NPTEL", type: "Tutorial" }, { time: "12:20 - 13:10", subjectKey: "NPTEL", type: "Tutorial" }, { time: "13:40 - 14:30", subjectKey: "WTTUT", type: "Tutorial" }, { time: "14:30 - 15:20", subjectKey: "WTTUT", type: "Tutorial" }],
        sunday: []
    };

    // =========================================================================
    
    const container = document.getElementById("timetable-container");
    const dayOrder = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
    let countdownIntervals = [];

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
                card.innerHTML = `<h3>${subjectInfo.name}</h3><p>${item.time}</p><p><em>${item.type}</em></p>`;
                list.appendChild(card);
            });
        } else {
            list.innerHTML = `<div class="class-card" style="--subject-color: var(--text)"><h3>No Classes Today 🎉</h3></div>`;
        }
        panel.appendChild(list);
        container.appendChild(panel);
    });

    // --- SMART LIVE HEADER LOGIC ---
    const clockElement = document.getElementById("current-time-large");
    const dateElement = document.getElementById("current-date");
    const upcomingList = document.getElementById("upcoming-list");

    function findNextNClasses(count) {
        const now = new Date();
        const currentDayIndex = (now.getDay() + 6) % 7;
        const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();
        let upcomingClasses = [];

        for (let i = 0; i < 7; i++) {
            const dayIndex = (currentDayIndex + i) % 7;
            const dayName = dayOrder[dayIndex];
            const daySchedule = timetableData[dayName];

            if (daySchedule && daySchedule.length > 0) {
                for (const item of daySchedule) {
                    const [startTimeStr] = item.time.split(' - ');
                    const [startHours, startMinutes] = startTimeStr.split(':').map(Number);
                    const startTime = startHours * 60 + startMinutes;
                    
                    if (i === 0 && startTime > currentTimeInMinutes) {
                        upcomingClasses.push({ ...item, day: dayName });
                    } else if (i > 0) {
                        upcomingClasses.push({ ...item, day: dayName });
                    }
                    if (upcomingClasses.length >= count) return upcomingClasses;
                }
            }
        }
        return upcomingClasses;
    }

    function updateLiveHeader() {
        // Update clock and date
        const now = new Date();
        clockElement.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        dateElement.textContent = now.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

        // Update upcoming list
        const nextClasses = findNextNClasses(3);
        upcomingList.innerHTML = '';
        countdownIntervals.forEach(clearInterval);
        countdownIntervals = [];

        if (nextClasses.length > 0) {
            nextClasses.forEach((item, index) => {
                const subjectInfo = subjects[item.subjectKey];
                const li = document.createElement("div");
                li.className = "upcoming-item";
                li.innerHTML = `
                    <div class="subject-info">
                        <div class="color-dot" style="background-color: ${subjectInfo.color}"></div>
                        <div>
                            <div class="subject">${subjectInfo.name}</div>
                            <div class="time">${item.day.charAt(0).toUpperCase() + item.day.slice(1)} at ${item.time.split(' - ')[0]}</div>
                        </div>
                    </div>
                    <div class="countdown" id="countdown-${index}"></div>
                `;
                upcomingList.appendChild(li);

                // Start a countdown for this specific item
                const countdownElement = document.getElementById(`countdown-${index}`);
                const intervalId = setInterval(() => {
                    const now2 = new Date();
                    const [startHours, startMinutes] = item.time.split(' - ')[0].split(':').map(Number);
                    let nextClassDate = new Date();
                    const dayDiff = (dayOrder.indexOf(item.day) - ((now2.getDay() + 6) % 7) + 7) % 7;
                    nextClassDate.setDate(now2.getDate() + dayDiff);
                    nextClassDate.setHours(startHours, startMinutes, 0, 0);

                    const diff = nextClassDate - now2;
                    if (diff > 0) {
                        const h = Math.floor(diff / 1000 / 60 / 60);
                        const m = Math.floor(diff / 1000 / 60) % 60;
                        const s = Math.floor(diff / 1000) % 60;
                        countdownElement.textContent = `in ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
                    } else {
                        countdownElement.textContent = "Starting...";
                        clearInterval(intervalId);
                    }
                }, 1000);
                countdownIntervals.push(intervalId);
            });
        } else {
            upcomingList.innerHTML = `<div class="upcoming-item">No upcoming classes found.</div>`;
        }
    }

    // --- ANIMATIONS ---
    gsap.utils.toArray(".panel").forEach(panel => {
        gsap.from(panel.querySelectorAll(".class-card"), {
            scrollTrigger: { trigger: panel, start: "top 80%", toggleActions: "play none none reverse" },
            y: 40, opacity: 0, stagger: 0.1, duration: 0.5
        });
    });

    // --- INITIALIZE & RUN ---
    updateLiveHeader(); // Run once on load
    setInterval(updateLiveHeader, 30000); // Re-check for new classes every 30 seconds
    setInterval(() => { // Update the main clock every second
        const now = new Date();
        clockElement.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }, 1000);
});
