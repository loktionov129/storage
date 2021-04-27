package com.example.samples;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.EditText;
import android.widget.TextView;

import androidx.annotation.Nullable;

public class RoutingViaIntentFillForm extends Activity {

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.routing_via_intent_fill_form);

        Intent intent = getIntent();
        String randomNumber = intent.getStringExtra("random_number");
        TextView randomNumberText = findViewById(R.id.random_number);
        randomNumberText.setText(randomNumber);
    }

    public void onFillForm(View view) {
        EditText loginText = findViewById(R.id.login);
        EditText passwordText = findViewById(R.id.password);
        Intent intent = new Intent();
        intent.putExtra("login", loginText.getText().toString());
        intent.putExtra("password", passwordText.getText().toString());

        setResult(RESULT_OK, intent);
        finish();
    }
}
