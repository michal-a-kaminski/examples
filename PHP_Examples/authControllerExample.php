<?php

namespace App\Http\Controllers\Mobile;

use App\Http\Controllers\Controller;
use App\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use JWTAuth;
use Response;
use Tymon\JWTAuth\Exceptions\JWTException;

class AuthController extends Controller
{
    /**
     * Create a new AuthController instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('jwt.auth', ['except' => ['login', 'register']]);
    }

    /**
     * Get a JWT via given credentials.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function login()
    {

        $email = request('email');
        $user = User::where('email', $email)->firstOrFail();
        if ($user == null) {
            return response()->json(['error' => 'Użytkownik nie istnieje'], 403, [], JSON_UNESCAPED_UNICODE);
        }

        if ($user->verified == 0) {
            return response()->json(['error' => 'Użytkownik nie jest aktywny'], 403, [], JSON_UNESCAPED_UNICODE);
        }

        $credentials = request(['email', 'password']);

        if (!$token = JWTAuth::attempt($credentials)) {
            return response()->json(['error' => 'Brak autoryzacji'], 401);
        }

        return $this->respondWithToken($token);
    }

    /**
     * Get the authenticated User.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function verifyToken()
    {
        try {

            if (!$user = JWTAuth::parseToken()->authenticate()) {
                return response()->json(['error' => 'Użytkownik nie istnieje'], 404);
            }

        } catch (Tymon\JWTAuth\Exceptions\TokenExpiredException $e) {

            return response()->json(['error' => 'Token wygasł'], $e->getStatusCode(), [], JSON_UNESCAPED_UNICODE);

        } catch (Tymon\JWTAuth\Exceptions\TokenInvalidException $e) {

            return response()->json(['error' => 'Nieprawidłowy token'], $e->getStatusCode(), [], JSON_UNESCAPED_UNICODE);

        } catch (Tymon\JWTAuth\Exceptions\JWTException $e) {

            return response()->json(['error' => 'Brak tokena'], $e->getStatusCode(), [], JSON_UNESCAPED_UNICODE);

        }
        return response()->json(['message' => 'Prawidłowy token'], 200, [], JSON_UNESCAPED_UNICODE);
    }

    public function redirect(Request $request)
    {
        $access_token = $request->access_token;
        return response()->json($access_token);
    }

    /**
     * Log the user out (Invalidate the token).
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout()
    {
        auth()->logout();

        return response()->json(['message' => 'Successfully logged out']);
    }

    /**
     * Refresh a token.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function refresh()
    {
        return $this->respondWithToken(auth()->refresh());
    }

    /**
     * Get the token array structure.
     *
     * @param  string $token
     *
     * @return \Illuminate\Http\JsonResponse
     */
    protected function respondWithToken($token)
    {
        return response()->json([
            'token' => $token,
            // 'token_type' => 'bearer',
            // 'expires_in' => auth()->factory()->getTTL() * 60
        ]);
    }
}
