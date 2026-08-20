const $ = id => document.getElementById(id);

let catId = null;
let qs = [];
let i = 0;
let score = 0;
let time = 15;
let timer = null;

// خلط العناصر
function shuffle(array) {
    const arr = [...array];

    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    return arr;
}

// إنشاء الفئات
CONFIG.categories.forEach(category => {

    const button = document.createElement("button");

    button.className = "cat";

    button.innerHTML = `
        <span class="icon">${category.icon}</span>
        <b>${category.name}</b>
        <small>20 سؤال</small>
    `;

    button.onclick = () => start(category.id);

    $("cats").appendChild(button);
});


// بدء الاختبار
function start(id) {

    catId = id;

    const category = CONFIG.categories.find(
        c => c.id === id
    );

    const categoryName = category.name;

    // أخذ أسئلة الفئة
    const allQuestions = CONFIG.questions.filter(
        q => q.category === categoryName
    );

    // خلط الأسئلة
    qs = shuffle(allQuestions).slice(
        0,
        CONFIG.questionsPerGame
    );

    i = 0;
    score = 0;

    $("score").textContent = score;
    $("tot").textContent = qs.length;

    $("topStats").classList.remove("hide");

    show("quiz");

    loadQuestion();
}


// عرض السؤال
function loadQuestion() {

    clearInterval(timer);

    let question = qs[i];

    // 🔥 خلط الإجابات
    const answersWithIndex = question.a.map(
        (answer, index) => ({
            answer: answer,
            originalIndex: index
        })
    );

    const shuffledAnswers = shuffle(
        answersWithIndex
    );

    // معرفة مكان الإجابة الصحيحة بعد الخلط
    question.shuffledAnswers = shuffledAnswers;

    question.shuffledCorrectIndex =
        shuffledAnswers.findIndex(
            answer =>
                answer.originalIndex === question.correct
        );

    $("cur").textContent = i + 1;

    $("catName").textContent =
        question.category;

    $("q").textContent =
        question.q;

    $("answers").innerHTML = "";

    $("next").classList.add("hide");

    $("bar").style.width =
        (i / qs.length * 100) + "%";

    time = CONFIG.timePerQuestion;

    $("time").textContent = time;


    // إنشاء الاختيارات
    shuffledAnswers.forEach(
        (item, index) => {

            const button =
                document.createElement("button");

            button.className = "answer";

            button.textContent =
                item.answer;

            button.onclick = () =>
                answer(index);

            $("answers").appendChild(button);
        }
    );


    // المؤقت
    timer = setInterval(() => {

        time--;

        $("time").textContent = time;

        if (time <= 0) {

            clearInterval(timer);

            answer(-1);
        }

    }, 1000);
}


// الإجابة
function answer(selectedIndex) {

    clearInterval(timer);

    const question = qs[i];

    const buttons =
        document.querySelectorAll(".answer");

    buttons.forEach(
        (button, index) => {

            button.disabled = true;

            // الإجابة الصحيحة
            if (
                index ===
                question.shuffledCorrectIndex
            ) {

                button.classList.add(
                    "correct"
                );
            }

            // إجابة المستخدم الخاطئة
            if (
                index === selectedIndex &&
                selectedIndex !==
                question.shuffledCorrectIndex
            ) {

                button.classList.add(
                    "wrong"
                );
            }
        }
    );


    // إذا كانت الإجابة صحيحة
    if (
        selectedIndex ===
        question.shuffledCorrectIndex
    ) {

        score += 10;

        $("score").textContent =
            score;
    }


    // زر التالي
    if (
        i === qs.length - 1
    ) {

        $("next").textContent =
            "عرض النتيجة →";

    } else {

        $("next").textContent =
            "السؤال التالي →";
    }

    $("next").classList.remove(
        "hide"
    );
}


// السؤال التالي
$("next").onclick = () => {

    if (i < qs.length - 1) {

        i++;

        loadQuestion();

    } else {

        finish();
    }
};


// النتيجة
function finish() {

    clearInterval(timer);

    show("result");

    $("final").textContent =
        score;

    let title;

    if (score === 100) {

        title = "🏆 نتيجة كاملة!";

    } else if (score >= 70) {

        title = "🔥 ممتاز!";

    } else if (score >= 50) {

        title = "👏 جيد!";

    } else {

        title = "💪 حاول مرة أخرى!";
    }

    $("title").textContent =
        title;

    $("resultText").textContent =
        `أجبت بشكل صحيح عن ${score / 10} من ${qs.length} أسئلة.`;
}


// تغيير الصفحة
function show(id) {

    document
        .querySelectorAll(".screen")
        .forEach(screen => {

            screen.classList.remove(
                "active"
            );

        });

    $(id).classList.add(
        "active"
    );
}


// إعادة نفس الفئة
$("again").onclick = () => {

    start(catId);
};


// العودة لاختيار الفئة
$("back").onclick = () => {

    clearInterval(timer);

    $("topStats")
        .classList.add("hide");

    show("home");
};