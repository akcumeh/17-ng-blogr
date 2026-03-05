const calcReadingTime = (text: string): number => {
    const wpm = 200;
    const wordCount = text.trim().split(/\s+/).length;
    return Math.ceil(wordCount / wpm);
};

export default calcReadingTime;