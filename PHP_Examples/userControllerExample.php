<?php

namespace App\Http\Controllers\Mobile;

use App\Http\Controllers\Controller;
use App\User;
use App\UserAddress;
use Hash;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Response;
use Validator;

class UserController extends Controller
{
    protected $request;

    public function __construct()
    {
        $this->content = array();
    }

    public function test()
    {
        return response()->json(['test' => 'test'], 200);
    }

    public function validationErrorsToString($errArray)
    {
        $valArr = array();
        foreach ($errArray->toArray() as $key => $value) {
            $errStr = /*$key.' '.*/$value[0];
            array_push($valArr, $errStr);
        }
        if (!empty($valArr)) {
            $errStrFinal = implode(' ', $valArr);
        }
        return $errStrFinal;
    }

    public function getData(Request $request)
    {
        $user = $request->user();
        $result = User::where('id', '=', $user->id)->with('userAddress')->get();
        return response()->json($result);
    }

    public function register(Request $request)
    {

        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email|max:60|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            $result = $this->validationErrorsToString($validator->errors());
            return response()->json(['error' => $validator->messages()], 406, [], JSON_UNESCAPED_UNICODE);
        };

        $check = User::where('email', '=', $request['email'])->first();
        if (!empty($check)) {
            return response()->json(['error' => 'Konto z tym adresem E-mail jest już istnieje'], 400, [], JSON_UNESCAPED_UNICODE);
        }

        $userID = DB::transaction(function () use ($request) {

            $id = DB::table('users')->insertGetId([
                'email' => $request['email'],
                'password' => Hash::make($request['password']),
            ]);
            $userAddress = UserAddress::create([
                'user_id' => $id,
                'name' => '',
                'address_DATA' => '',
            ]);

            return $id;
        });

        $user = User::find($userID);
        //TODO: Sprawdzenie czy istnieje i wysłanie wiadomości z linkiem weryfikacji

        return response()->json("Utworzono użytkownika. Aktywuj konto linkiem przesłanym na Twoją pocztę", 200, [], JSON_UNESCAPED_UNICODE);
        // return response()->json("Utworzono uĹĽytkownika. Aktywuj konto linkiem przesĹ‚anym na TwojÄ… pocztÄ™", 200, [], JSON_UNESCAPED_UNICODE);
    }

}
