$(document).ready(function () {

    $('#menu').click(function () {
        $(this).toggleClass('fa-times');
        $('.navbar').toggleClass('nav-toggle');
    });

    $(window).on('scroll load', function () {
        $('#menu').removeClass('fa-times');
        $('.navbar').removeClass('nav-toggle');

        if (window.scrollY > 60) {
            document.querySelector('#scroll-top').classList.add('active');
        } else {
            document.querySelector('#scroll-top').classList.remove('active');
        }

        // scroll spy
        $('section').each(function () {
            let height = $(this).height();
            let offset = $(this).offset().top - 200;
            let top = $(window).scrollTop();
            let id = $(this).attr('id');

            if (top > offset && top < offset + height) {
                $('.navbar ul li a').removeClass('active');
                $('.navbar').find(`[href="#${id}"]`).addClass('active');
            }
        });
    });

    // smooth scrolling
    $('a[href*="#"]').on('click', function (e) {
        e.preventDefault();
        $('html, body').animate({
            scrollTop: $($(this).attr('href')).offset().top,
        }, 500, 'linear')
    });

    // Send contact form to mail client using your email address
    $("#contact-form").submit(function (event) {
        event.preventDefault();
        const formData = new FormData(document.getElementById("contact-form"));
        const name = (formData.get("name") || "").toString().trim();
        const email = (formData.get("email") || "").toString().trim();
        const phone = (formData.get("phone") || "").toString().trim();
        const message = (formData.get("message") || "").toString().trim();

        const subject = "Portfolio Contact";
        const body = [
            `Name: ${name}`,
            `Email: ${email}`,
            `Phone: ${phone}`,
            "",
            message,
        ].join("\n");

        window.location.href = `mailto:utsavanand0209@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        document.getElementById("contact-form").reset();
    });

});

document.addEventListener('visibilitychange',
    function () {
        if (document.visibilityState === "visible") {
            document.title = "Portfolio | Utsav Anand";
            $("#favicon").attr("href", "assets/images/favicon.png");
        }
        else {
            document.title = "Come Back To Portfolio";
            $("#favicon").attr("href", "assets/images/favhand.png");
        }
    });


// <!-- typed js effect starts -->
var typed = new Typed(".typing-text", {
    strings: ["backend development", "full-stack development", "conversational AI", "android development", "systems programming"],
    loop: true,
    typeSpeed: 50,
    backSpeed: 25,
    backDelay: 500,
});
// <!-- typed js effect ends -->

async function fetchData(type = "skills") {
    let response
    type === "skills" ?
        response = await fetch("skills.json")
        :
        response = await fetch("./projects/projects.json")
    const data = await response.json();
    return data;
}

function showSkills(skills) {
    let skillsContainer = document.getElementById("skillsContainer");
    let skillHTML = "";
    skills.forEach(skill => {
        skillHTML += `
        <div class="bar">
              <div class="info">
                <img src=${skill.icon} alt="skill" />
                <span>${skill.name}</span>
              </div>
            </div>`
    });
    skillsContainer.innerHTML = skillHTML;
}

function showProjects(projects) {
    let projectsContainer = document.querySelector("#work .box-container");
    let projectHTML = "";
    projects.slice(0, 10).forEach(project => {
        projectHTML += `
        <div class="box tilt">
      <img draggable="false" src="./assets/images/projects/${project.image}.png" alt="project" />
      <div class="content">
        <div class="tag">
        <h3>${project.name}</h3>
        </div>
        <div class="desc">
          <p>${project.desc}</p>
          <div class="btns">
            <a href="${project.links.view}" class="btn" target="_blank"><i class="fas fa-eye"></i> View</a>
            <a href="${project.links.code}" class="btn" target="_blank">Code <i class="fas fa-code"></i></a>
          </div>
        </div>
      </div>
    </div>`
    });
    projectsContainer.innerHTML = projectHTML;

    // <!-- tilt js effect starts -->
    VanillaTilt.init(document.querySelectorAll(".tilt"), {
        max: 15,
    });
    // <!-- tilt js effect ends -->

    /* ===== SCROLL REVEAL ANIMATION ===== */
    const srtop = ScrollReveal({
        origin: 'top',
        distance: '80px',
        duration: 1000,
        reset: true
    });

    /* SCROLL PROJECTS */
    srtop.reveal('.work .box', { interval: 200 });

}

fetchData().then(data => {
    showSkills(data);
});

fetchData("projects").then(data => {
    showProjects(data);
});

// <!-- tilt js effect starts -->
VanillaTilt.init(document.querySelectorAll(".tilt"), {
    max: 15,
});
// <!-- tilt js effect ends -->


// pre loader start
// function loader() {
//     document.querySelector('.loader-container').classList.add('fade-out');
// }
// function fadeOut() {
//     setInterval(loader, 500);
// }
// window.onload = fadeOut;
// pre loader end

// disable developer mode
document.onkeydown = function (e) {
    if (e.keyCode == 123) {
        return false;
    }
    if (e.ctrlKey && e.shiftKey && e.keyCode == 'I'.charCodeAt(0)) {
        return false;
    }
    if (e.ctrlKey && e.shiftKey && e.keyCode == 'C'.charCodeAt(0)) {
        return false;
    }
    if (e.ctrlKey && e.shiftKey && e.keyCode == 'J'.charCodeAt(0)) {
        return false;
    }
    if (e.ctrlKey && e.keyCode == 'U'.charCodeAt(0)) {
        return false;
    }
}

function initPortfolioChatbot() {
    const widget = document.getElementById("portfolio-chatbot");
    if (!widget) return;

    const toggleBtn = document.getElementById("chatbot-toggle");
    const closeBtn = document.getElementById("chatbot-close");
    const panel = document.getElementById("chatbot-panel");
    const form = document.getElementById("chatbot-form");
    const input = document.getElementById("chatbot-input");
    const messages = document.getElementById("chatbot-messages");
    const quickActions = document.getElementById("chatbot-quick-actions");

    const projectNames = [
        "advanced-chatbot",
        "Ngo-Connect",
        "Ayurvedic-Treatment",
        "triage-bot",
        "Task-Manager",
    ];

    const botReplies = [
        {
            match: /(hi|hello|hey|greet)/i,
            reply: "Hi! I'm Utsav's assistant. Ask me about projects, skills, experience, certifications, resume, or how to reach out.",
        },
        {
            match: /(project|work|portfolio|made)/i,
            reply: `Top projects include ${projectNames.join(", ")}. Check the Work section to explore all 10+ projects with details.`,
        },
        {
            match: /(backend|api|server|node|python|java|flask|express)/i,
            reply: "Utsav specializes in backend development: Node.js, Express, Python (Flask), Java Spring Boot, RESTful APIs, microservices, and DevOps deployment.",
        },
        {
            match: /(skill|tools|tech|stack|technology)/i,
            reply: "Skills: Java, TypeScript, Python, JavaScript, Node.js, Express, React, Angular, Flask, PostgreSQL, MongoDB, Docker, AWS, CI/CD, and 28+ total technologies.",
        },
        {
            match: /(certif|achievement|award|cert)/i,
            reply: "Certifications: NCAT Exam (Rank 6423), Software Engineering Trainee (YuvaIntern 2026), Web Development (CodSoft 2024), and JITHACK'24 Hackathon Winner.",
        },
        {
            match: /(experience|intern|job|work|employment)/i,
            reply: "Experience: YuvaIntern (Software Engineering Trainee, Feb-Apr 2026), Skillbit Technologies (Android Dev, Jun-Jul 2025), CodSoft (Web Dev, Jul-Aug 2024).",
        },
        {
            match: /(resume|cv|download)/i,
            reply: "Download resume from the About section. It includes full details of skills, projects, internships, and certifications.",
        },
        {
            match: /(contact|email|phone|reach|linkedin|message)/i,
            reply: "Contact: utsavanand0209@gmail.com | LinkedIn: linkedin.com/in/utsav02 | GitHub: github.com/utsavanand0209",
        },
        {
            match: /(location|city|address|place|bangalore)/i,
            reply: "Utsav is based in Bangalore, India. Currently pursuing B.Tech in CSE at CMR University (2022-2026, CGPA 7.81).",
        },
        {
            match: /(education|college|university|degree)/i,
            reply: "Education: B.Tech CSE from CMR University, Bangalore (CGPA 7.81/10). Higher Secondary from Kamla High School (71.20%).",
        },
        {
            match: /(full.?stack|fullstack|frontend|backend|developer)/i,
            reply: "Entry-level Software Engineer with backend focus. Builds scalable RESTful services, responsive UIs, and complete full-stack applications.",
        },
    ];


    function addMessage(role, text) {
        const bubble = document.createElement("div");
        bubble.className = `chatbot-bubble ${role}`;
        bubble.textContent = text;
        messages.appendChild(bubble);
        messages.scrollTop = messages.scrollHeight;
    }

    function getBotResponse(text) {
        const normalized = text.trim();
        for (const rule of botReplies) {
            if (rule.match.test(normalized)) {
                return rule.reply;
            }
        }
        return "I can help with projects, skills, resume, or contact details. Try asking: 'show backend projects' or 'what tools do you use?'";
    }

    function openPanel() {
        panel.classList.add("open");
        panel.setAttribute("aria-hidden", "false");
        input.focus();
    }

    function closePanel() {
        panel.classList.remove("open");
        panel.setAttribute("aria-hidden", "true");
    }

    toggleBtn.addEventListener("click", function () {
        if (panel.classList.contains("open")) {
            closePanel();
        } else {
            openPanel();
        }
    });

    closeBtn.addEventListener("click", closePanel);

    quickActions.addEventListener("click", function (event) {
        const btn = event.target.closest("button[data-prompt]");
        if (!btn) return;
        const prompt = btn.getAttribute("data-prompt");
        addMessage("user", prompt);
        setTimeout(function () {
            addMessage("bot", getBotResponse(prompt));
        }, 220);
    });

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        const userText = input.value.trim();
        if (!userText) return;

        addMessage("user", userText);
        input.value = "";

        setTimeout(function () {
            addMessage("bot", getBotResponse(userText));
        }, 260);
    });

    addMessage("bot", "Welcome. I can guide you through Utsav's projects, tools, and experience.");
}

initPortfolioChatbot();


/* ===== SCROLL REVEAL ANIMATION ===== */
const srtop = ScrollReveal({
    origin: 'top',
    distance: '80px',
    duration: 1000,
    reset: true
});

/* SCROLL HOME */
srtop.reveal('.home .content h3', { delay: 200 });
srtop.reveal('.home .content p', { delay: 200 });
srtop.reveal('.home .content .btn', { delay: 200 });

srtop.reveal('.home .image', { delay: 400 });
srtop.reveal('.home .linkedin', { interval: 600 });
srtop.reveal('.home .github', { interval: 800 });
srtop.reveal('.home .twitter', { interval: 1000 });
srtop.reveal('.home .telegram', { interval: 600 });
srtop.reveal('.home .instagram', { interval: 600 });
srtop.reveal('.home .dev', { interval: 600 });

/* SCROLL ABOUT */
srtop.reveal('.about .content h3', { delay: 200 });
srtop.reveal('.about .content .tag', { delay: 200 });
srtop.reveal('.about .content p', { delay: 200 });
srtop.reveal('.about .content .box-container', { delay: 200 });
srtop.reveal('.about .content .resumebtn', { delay: 200 });


/* SCROLL SKILLS */
srtop.reveal('.skills .container', { interval: 200 });
srtop.reveal('.skills .container .bar', { delay: 400 });

/* SCROLL EDUCATION */
srtop.reveal('.education .box', { interval: 200 });

/* SCROLL PROJECTS */
srtop.reveal('.work .box', { interval: 200 });

/* SCROLL EXPERIENCE */
srtop.reveal('.experience .timeline', { delay: 400 });
srtop.reveal('.experience .timeline .container', { interval: 400 });

/* SCROLL CONTACT */
srtop.reveal('.contact .container', { delay: 400 });
srtop.reveal('.contact .container .form-group', { delay: 400 });
