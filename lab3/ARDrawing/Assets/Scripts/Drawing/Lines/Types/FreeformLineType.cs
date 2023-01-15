using UnityEngine;

namespace Drawing.Lines.Types
{
    public class FreeformLineType : LineType
    {
        public FreeformLineType(GameObject linePrefab, GameObject dotPrefab, GameObject parentObject) : base(linePrefab, dotPrefab, parentObject) { }

        protected override void AddPointToLine(Vector3 point)
        {
            _lineRenderer.pathData.positions.Add(point);
            _lineRenderer.UpdateMesh();
        }
    }
}
