<?
	$this->AddEditAction($arItem['ID'], $arItem['EDIT_LINK'], CIBlock::GetArrayByID($arItem["IBLOCK_ID"], "ELEMENT_EDIT"));
	$this->AddDeleteAction($arItem['ID'], $arItem['DELETE_LINK'], CIBlock::GetArrayByID($arItem["IBLOCK_ID"], "ELEMENT_DELETE"), array("CONFIRM" => GetMessage('CT_BNL_ELEMENT_DELETE_CONFIRM')));
?>
<article id="<?=$this->GetEditAreaId($arItem["ID"]);?>">
    <p><?=$arItem["SOME_INFO"]?></p>
</article>











$rubrics = array_flip(array(
	72=>"Косметические наборы",
	73=>"Лечебный трикотаж",
	70=>"Здоровье",
	71=>"Интимная гигиена",
	74=>"Макияж",
	75=>"Мама и малыш",
	83=>"Уход за полостью рта",
	82=>"Уход за ногтями",
	76=>"Парфюм",
	69=>"Заболевания кожи",
	81=>"Уход для рук",
	62=>"Волосы и кожа головы",
	77=>"Подарочные наборы",
	84=>"Уютный дом",
	63=>"Депиляция",
	78=>"Скорая помощь коже",
	80=>"Уход для ног",
	67=>"Для тела",
	64=>"Для глаз",
	65=>"Для лица",
	66=>"Для мужчин",
	68=>"Для/от загара",
	79=>"Техника для жизни",
));

$arSelect = Array("ID", "NAME", "DATE_ACTIVE_FROM", "PROPERTY_RUBRIKA");
$arFilter = Array("IBLOCK_ID"=>13, "SECTION_ID" =>515);
$res = CIBlockElement::GetList(Array(), $arFilter, false, Array(), $arSelect);
while($ob = $res->GetNextElement())
{
	$arFields = $ob->GetFields();
	CIBlockElement::SetPropertyValuesEx($arFields['ID'], 13, array("RUBRIC" => $rubrics[$arFields['PROPERTY_RUBRIKA_VALUE']]));
}
