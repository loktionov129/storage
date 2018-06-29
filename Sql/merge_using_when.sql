Merge SettingsValue As rsv
Using (
	Select id as RestaurantId,
		@SettingId as SettingId,
		@SettingValue As Value
	from ANOTHER_TABLE where FK_ID = @FK_ID
    And IsActive = 1
) As Source(ANOTHER_TABLEId, SettingId, Value) On rsv.ANOTHER_TABLEId = Source.ANOTHER_TABLEId And rsv.SettingsId = Source.SettingId
When Matched And (rsv.Value <> Source.Value) Then
    Update
    Set rsv.Value = Source.Value
When Not Matched By Target Then
    Insert
    (
        ANOTHER_TABLEId, SettingsId, Value
    )
    Values
    (
        Source.ANOTHER_TABLEId,
        Source.SettingId,
        Source.Value
    );
