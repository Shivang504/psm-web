import { takeLatest } from 'redux-saga/effects'
import { sagaActions } from '@/store/actions'
import { genericSaga } from '@/store/sagas/genericSaga/genericSaga'

export function* dashboardSaga() {
  yield takeLatest(sagaActions.GET_DASHBOARD, genericSaga)
  yield takeLatest(sagaActions.GET_TODAY_ATTENDANCE, genericSaga)
  yield takeLatest(sagaActions.START_DAY, genericSaga)
  yield takeLatest(sagaActions.END_DAY, genericSaga)
}
