<?php
use Illuminate\Http\Request;

Route::post('login', 'AuthController@login');
Route::post('register', 'UserController@register');
Route::get('verify', 'AuthController@verifyToken');
//Route::get('test', 'UserController@test');
Route::group(['middleware' => ['jwt.auth']], function () {
    Route::get('test', 'UserController@test');
    Route::get('data', 'UserController@getData');
});
