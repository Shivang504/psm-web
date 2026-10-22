import { all, fork } from 'redux-saga/effects'
import { authSaga } from './authSaga'
import { profileSaga } from './profileSaga'
import { usersSaga } from './usersSaga'

export function* rootSaga() {
  yield all([fork(authSaga), fork(profileSaga), fork(usersSaga)])
}
