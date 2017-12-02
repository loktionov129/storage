<?
$file = CFile::ResizeImageGet($arItem/*file ID || img array*/, array('width'=>1100, 'height'=>688), BX_RESIZE_IMAGE_EXACT, false);
?>
<img src="<?=$file['src']?>">
