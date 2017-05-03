<?php

	$arFilter = Array("IBLOCK_ID"=>$arItem['IBLOCK_ID'], "ID"=>$arItem[ID]);
	$res = CIBlockElement::GetList(Array(), $arFilter);
	$arProps = array();
	if ($ob = $res->GetNextElement())
	{
		$arProps = $ob->GetProperties();
	}
