import { all, fork } from 'redux-saga/effects'
import { authSaga } from './authSaga'
import { dashboardSaga } from './dashboardSaga'
import { profileSaga } from './profileSaga'
import { usersSaga } from './usersSaga'

export function* rootSaga() {
  yield all([
    fork(authSaga),
    fork(dashboardSaga),
    fork(profileSaga),
    fork(usersSaga),
  ])
}
