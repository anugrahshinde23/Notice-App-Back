function categorizeNotice(title,content){

    const text = (title + " " + content).toLowerCase();

    const examKeywords = ["exam", "test", "quiz", "midterm", "final"];
    const assignmentKeywords = ["assignment", "homework", "submission", "project"];
    const eventKeywords = ["event", "seminar", "workshop", "fest", "celebration"];
    const alertKeywords = ["urgent", "notice", "alert", "important", "warning"];


    if(examKeywords.some(word => text.includes(word)))
        return "Exam";
    else if(assignmentKeywords.some(word => text.includes(word)))
        return "Assignment";
    else if(eventKeywords.some(word => text.includes(word)))
        return "Event";
    else if(alertKeywords.some(word => text.includes(word)))
        return "Alert";
    else{
        return "General";
    }
}

module.exports = categorizeNotice;