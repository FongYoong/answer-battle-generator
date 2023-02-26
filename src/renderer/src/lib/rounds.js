const stringToInt = (string) => {
    const value = parseInt(string)
    return isNaN(value) ? undefined : value
}

export const convertRoundsTextToJSON = (roundsText) => {
    const typeRegex = /^\s*[\d]+\.(.*)/;
    const parameterRegex = /^\s*=(.*)/; // For normal round, it's a question. For lightning round, it's a timer duration
    const childRegex = /^\s*-(.*)/; // For normal round, it's an answer. For lightning round, it's a question.

    const rounds = []
    let currentRound;
    try {
        const lines = roundsText.split('\n')
        lines.forEach((line, line_index) => {
            const line_number = line_index + 1
            const typeMatches = line.match(typeRegex)
            const parameterMatches = line.match(parameterRegex)
            const childMatches = line.match(childRegex)

            if (typeMatches) {
                if (currentRound) {
                    rounds.push(currentRound)
                }
                const type = typeMatches[1].trim().toLowerCase()
                if (!['normal', 'lightning'].includes(type)) {
                    throw Error(`Line ${line_number}: Round type ${type} is not supported.`)
                }
                currentRound = { type }
            }
            else if (parameterMatches) {
                if (currentRound) {
                    const param = parameterMatches[1].trim()
                    if (currentRound.type == 'normal') {
                        currentRound['question'] = param
                    }
                    else if (currentRound.type == 'lightning') {
                        const timerValue = stringToInt(param)
                        if (timerValue == undefined) {
                            throw Error(`Line ${line_number}: Timer value ${param} is not a valid number.`)
                        }
                        currentRound['time'] = timerValue
                    }
                }
                else {
                    throw Error(`Line ${line_number}: Round type (normal/lightning) not specified.`)
                }
            }
            else if (childMatches) {
                if (currentRound) {
                    const splitted = childMatches[1].split(',').map((s) => s.trim())
                    if (currentRound.type == 'normal') {
                        if (!('question' in currentRound)) {
                            throw Error(`Line ${line_number}: Question of this round is not defined.`)
                        }
                        const points = stringToInt(splitted[1])
                        if (points == undefined) {
                            if (['', undefined].includes(splitted[1])) {
                                throw Error(`Line ${line_number}: Points is not specified.`)
                            }
                            else {
                                throw Error(`Line ${line_number}: Points ${splitted[1]} is not a valid number.`)
                            }
                        }
                        const child = {
                            answer: splitted[0],
                            points
                        }
                        if ('answers' in currentRound) {
                            currentRound['answers'].push(child)
                        }
                        else {
                            currentRound['answers'] = [child]
                        }
                    }
                    else if (currentRound.type == 'lightning') {
                        if (!('time' in currentRound)) {
                            throw Error(`Line ${line_number}: Timer duration of this round is not defined.`)
                        }
                        if (splitted[0] == undefined) {
                            throw Error(`Line ${line_number}: No question provided`)
                        }
                        if (splitted[1] == undefined) {
                            throw Error(`Line ${line_number}: No answer provided`)
                        }
                        const child = {
                            question: splitted[0],
                            answer: splitted[1]
                        }
                        if ('questions' in currentRound) {
                            currentRound['questions'].push(child)
                        }
                        else {
                            currentRound['questions'] = [child]
                        }
                    }
                }
                else {
                    throw Error(`Line ${line_number}: Round type (normal/lightning) not specified.`)
                }
            }
        })
        rounds.push(currentRound);
    }
    catch (e) {
        return e;
    }

    return rounds
}

export const defaultRoundsText =
`1. Normal
= Name a common New Year's Resolution
- Lose weight / Exercise, 100
- Save money, 90
- More time with friends/family, 80
- New job, 70
- Get organized, 60
- Break habits, 50
- Travel more, 40
- Read more, 30
2. Normal
= Name something people do right when New Year comes
- Kiss, 100
- Shout "Happy New Year!", 90
- Light fireworks, 80
- Make loud noises, 70
- Toast / Drink, 60
3. Lightning
= 60
- Capital of California, Sacramento
- Longest river in U.S, Missouri River
- Biggest state, Alaska
- 50th state, Hawaii
- State farthest south, Hawaii
- State with Mt. Rushmore, South Dakota
- City of Brotherly Love, Philadelphia
- City called the Big Apple, New York
- U.S city not in a state, Washington D.C.
- Capital of Idaho, Boise
4. Normal
= Name a common New Year's noise maker
- Fireworks, 100
- Kazoos, 90
- Trumpets / Instruments, 80
- Pots & Pans, 70
- Guns, 60
5. Normal
= Name Something You Would Buy A Lot Of When Hosting A New Year's Party
- Drinks, 100
- Food, 90
- Decorations, 80
- Utensils, 70
- Noise makers, 60
6. Normal
= Name a popular New Year's Eve TV host
- Dick Clark, 100
- Ryan Seacrest, 90
- Carson Daily, 80
- Anderson Cooper, 70`