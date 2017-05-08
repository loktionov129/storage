Публичная часть - параметры компонента - источник данных - необходимые поля:
$arItem['PROPERTIES']['DOUBLE']['VALUE']

////////////////////////////////////////////


Получить значения всех свойств элемента, зная его ID.
<?
	$db_props = CIBlockElement::GetProperty($arItem['IBLOCK_ID'], $arItem['ID'], "sort", "asc", array());
	$PROPS = array();
	while($ar_props = $db_props->Fetch())
		$PROPS[$ar_props['CODE']] = $ar_props['VALUE'];
?>

Получить свойства элементов, используя метод CIBlockElement::GetList
<?
	$arSelect = array("ID", "NAME", "PROPERTY_prop_code_1", "PROPERTY_prop_code_2");
	$res = CIBlockElement::GetList(array(), array(), false, array(), $arSelect);
?>

(2) Получить значения всех свойств элемента, зная его ID.
<?php

	$arFilter = Array("IBLOCK_ID"=>$arItem['IBLOCK_ID'], "ID"=>$arItem['ID']);
	$res = CIBlockElement::GetList(Array(), $arFilter);
	$arProps = array();
	if ($ob = $res->GetNextElement())
	{
		$arProps = $ob->GetProperties();
	}
?>
