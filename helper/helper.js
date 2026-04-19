const { Formatters, MessageEmbed } = require('discord.js');

function recordPlacingFormatter(playerTimeMapSort) {
    let result = ''
    let count = 1
    let emoji = ''
    playerTimeMapSort.forEach((value, key) => {
        if (count == 1) {
            emoji = ':first_place:'
        } else if (count == 2) {
            emoji = ':second_place:'
        } else if (count == 3) {
            emoji = ':third_place:'
        } else if (count == 4) {
            emoji = ':medal:'
        } else if (count == 5) {
            emoji = ':medal:'
        } else { emoji = '	  ' }

        result += `${emoji} ${Formatters.bold(key)} ${timeFormatter(value)}\n`
        count++
    })
    return result
}

function scoreFormatter(dictionary) {
    let result = []
    let place = ''
    let players = ''
    let scores = ''
    let count = 1
    for (let i = 0; i < dictionary['users'].length; i++) {
        players += `${dictionary['users'][i]['nameOnPlatform']}\n`
        scores += `${dictionary['users'][i]['sp']}\n`
        place += `${count}\n`
        count++
    }
    result.push(place)
    result.push(players)
    result.push(scores)
    return result
}

function timeFormatter(value) {
    // Handle special "No Time" value
    if (value === 4294967295 || value === -1) {
        return 'SECRET'
    }
    
    // Handle invalid or zero values
    if (!value || value <= 0) {
        return 'SECRET'
    }
    
    const valueToString = value.toString()
    
    // Handle very large values that might be corrupted
    if (valueToString.length > 8) {
        return 'SECRET'
    }
    
    const lastThree = valueToString.substring(valueToString.length - 3)
    let firstHalf = Number(valueToString.substring(0, valueToString.length - 3))
    
    if (isNaN(firstHalf) || firstHalf < 0) {
        return 'SECRET'
    }
    
    const minutes = Math.floor(firstHalf / 60).toString()
    const seconds = (firstHalf - minutes * 60).toString()
    let result = ''
    
    if (minutes == '0') {
        result = `${seconds}.${lastThree}`
    } else {
        if (seconds < 10) {
            result = `${minutes}:0${seconds}.${lastThree}`
        } else { 
            result = `${minutes}:${seconds}.${lastThree}` 
        }
    }
    return result
}

function embedFormatter(trackName, trackUid, value, authorName, authorAccountId) {
    const replyEmbed = new MessageEmbed()
        .setColor('#f4ca16')
        .setTitle(trackName)
        .setURL(`https://trackmania.io/#/leaderboard/${trackUid}`)
        .setAuthor({ name: `Created by ${authorName}`, iconURL: 'https://trackmania.io/img/square.png', url: `https://trackmania.io/#/player/${authorAccountId}` })
        .setThumbnail('https://trackmania.io/img/square.png')
        .addFields(
            { name: 'Track Leaders', value: value },
        )
        .setFooter({ text: 'This bot is currently in active development.' });

    return replyEmbed
}

function montanaEmbedFormatter(trackName, trackUid, value, authorName, authorAccountId) {
    // Montana-specific custom formatting
    const replyEmbed = new MessageEmbed()
        .setColor('#4A90E2') // Montana blue color
        .setTitle(`🏔️ ${trackName}`)
        .setURL(`https://trackmania.io/#/leaderboard/${trackUid}`)
        .setAuthor({ name: `Created by ${authorName}`, iconURL: 'https://trackmania.io/img/square.png', url: `https://trackmania.io/#/player/${authorAccountId}` })
        .setThumbnail('https://trackmania.io/img/square.png')
        .addFields(
            { name: '🏆 MT Leaderboards', value: value || 'No times recorded yet' },
        )
        .setFooter({ text: '🏔️ MT Trackmania Community | Weekly Shorts' });

    return replyEmbed
}

function embedScoresFormatter(data, campaign, ioCampaignId) {
    const replyEmbed = new MessageEmbed()
        .setColor('#f4ca16')
        .setTitle(`Score Leaders for ${campaign}`)
        .setURL(`https://trackmania.io/#/campaigns/0/${ioCampaignId}`)
        .setDescription(`${campaign} Score Leaders`)
        .addFields(
            { name: 'Rank', value: data[0], inline: true },
            { name: 'Player', value: Formatters.bold(data[1]), inline: true },
            { name: 'Score', value: data[2], inline: true },
        )
        .setFooter({ text: 'This bot is currently in active development.' });

    return replyEmbed
}

module.exports = {
    embedFormatter,
    montanaEmbedFormatter,
    timeFormatter,
    embedScoresFormatter,
    recordPlacingFormatter,
    scoreFormatter
};