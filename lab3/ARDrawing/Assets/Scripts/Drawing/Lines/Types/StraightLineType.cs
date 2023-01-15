using System.Collections.Generic;
using UnityEngine;

namespace Drawing.Lines.Types
{
    public class StraightLineType : LineType
    {
        public StraightLineType(GameObject linePrefab, GameObject dotPrefab, GameObject parentObject) : base(linePrefab, dotPrefab, parentObject) { }

        protected override void AddPointToLine(Vector3 point)
        {
            List<Vector3> positions = _lineRenderer.pathData.positions;
            if (positions.Count > 1) _lineRenderer.pathData.positions.RemoveRange(1, positions.Count - 1);

            _lineRenderer.pathData.positions.Add(point);
            _lineRenderer.UpdateMesh();
        }
    }
}
