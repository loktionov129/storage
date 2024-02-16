// https://steamcommunity.com/id/%username%/stats/%appid%/achievements/
const allAchievements = [...document.getElementsByClassName('achieveRow')];
const startIndex = allAchievements.findIndex(x => x.nextElementSibling.tagName.toLowerCase() == 'br')
const earnedaAchievementNames = [...allAchievements]
	.slice(0, 1 + startIndex)
	.map(el => el.getElementsByClassName('ellipsis')[0].innerText)
JSON.stringify( earnedaAchievementNames );

// https://steamcommunity.com/stats/%appid%/achievements/
const earnedaAchievementJson = `%json%`;
const earnedaAchievementNames = JSON.parse(earnedaAchievementJson);
[...document.getElementsByClassName('achieveRow')]
	.filter(el => earnedaAchievementNames.include(el.getElementsByTagName('h3')[0].innerText))
	.forEach(el => el.remove())
