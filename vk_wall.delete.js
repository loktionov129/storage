// tab #1
// https://vk.com/id0
JSON.stringify([...document.querySelectorAll('.feed_wall--no-islands ._post.post')] // находим все посты на стене
    .filter(post => [...post.querySelectorAll('a')].find(a => a.textContent === 'vk.com/app3882511#wallpublic')) // фильтруем их
    .map(post => post.id.split('_')[1])) // получаем идентификаторы постов для удаления




// tab #2
// https://api.vk.com/method/wall.delete
// предварительно удаляем вручную один пост, затем во вкладке Network копируем запрос "Copy as fetch"
// и не забываем обновлять токен
async function deletePost(id)
{
  await fetch("https://api.vk.com/method/wall.delete?v=12313123131312312312313123131313&client_id=12313123131312312312313123131313", {
        "body": "owner_id=12313123131312312312313123131313&post_id="+id+"&access_token=12313123131312312312313123131313",
        "method": "POST",
    });
    await new Promise(resolve => setTimeout(resolve, 500));
}
var posts =
["сюда", "подставляем", "список", "идентификаторов", "постов"]
;(async function(){ for (var post of posts) { await deletePost(post); } })();
